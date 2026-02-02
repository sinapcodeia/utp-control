const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const SERVICE_KEY = 'sb_secret_mi2hJTvLZ9i9xSy5Q9bmyQ_JY5PaLg1';
const SUPABASE_URL = 'https://mhaqatbmjuqdodaczlmc.supabase.co';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

const users = [
    { email: 'admin@test.com', password: 'UTPControl2026!', role: 'ADMIN', name: 'Admin Test Forced' },
    { email: 'coord@test.com', password: 'UTPControl2026!', role: 'COORDINATOR', name: 'Coord Test Forced' },
    { email: 'gestor@test.com', password: 'UTPControl2026!', role: 'USER', name: 'Gestor Test Forced' }
];

async function main() {
    console.log(`\n--- FORCE CREATING ALL USERS ---`);

    for (const user of users) {
        console.log(`\nProcessing ${user.email}...`);

        // 1. Clean up Auth
        const { data: listData } = await supabase.auth.admin.listUsers();
        const existing = listData?.users.find(u => u.email === user.email);
        if (existing) {
            await supabase.auth.admin.deleteUser(existing.id);
            console.log('Deleted existing Auth user.');
        }

        // 2. Create Auth
        const { data, error } = await supabase.auth.admin.createUser({
            email: user.email,
            password: user.password,
            email_confirm: true,
            user_metadata: {
                full_name: user.name,
                accepted_terms: true,
                accepted_at: new Date().toISOString()
            }
        });

        if (error) {
            console.error('Create Failed:', error.message);
            continue;
        }
        console.log(`Created Auth User: ${data.user.id}`);

        // 3. Update DB
        await new Promise(resolve => setTimeout(resolve, 1500)); // Wait for trigger

        try {
            let permissions = {};
            let regionId = null;

            if (user.role === 'ADMIN') {
                permissions = {
                    dir: { view: true, edit: true, delete: true },
                    news: { view: true, edit: true, create: true, edit_own: true, edit_all: true, delete: true },
                    staff: { invite: true, manage_perms: true, block: true },
                    territory: { allRegions: true, regions: [] }
                };
            } else if (user.role === 'COORDINATOR') {
                const region = await prisma.region.findFirst({ where: { name: 'Región Central' } });
                regionId = region?.id;
                permissions = {
                    dir: { view: true, edit: true, delete: false },
                    news: { view: true, edit: true, create: true, edit_own: true, edit_all: false, delete: true },
                    staff: { invite: true, manage_perms: false, block: false },
                    territory: { allRegions: false, regions: [] }
                };
            } else {
                permissions = {
                    dir: { view: true, edit: false, delete: false },
                    news: { view: true, edit: false, create: false, edit_own: false, edit_all: false, delete: false },
                    staff: { invite: false, manage_perms: false, block: false },
                    territory: { allRegions: false, regions: [] }
                };
            }

            // Upsert logic
            const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
            if (!dbUser) {
                await prisma.user.create({
                    data: {
                        id: data.user.id,
                        email: user.email,
                        fullName: user.name,
                        passwordHash: 'SUPABASE_AUTH_MANAGED',
                        dni: `SYNC-${data.user.id.substring(0, 8)}`,
                        role: user.role,
                        permissions: permissions,
                        regionId: regionId,
                        isActive: true,
                        acceptedTerms: true
                    }
                });
                console.log('Inserted into DB manually.');
            } else {
                await prisma.user.update({
                    where: { email: user.email },
                    data: {
                        role: user.role,
                        permissions: permissions,
                        regionId: regionId,
                        isActive: true,
                        acceptedTerms: true
                    }
                });
                console.log('Updated DB permissions.');
            }

        } catch (e) {
            console.error('DB Error:', e.message);
        }
    }
    console.log('\n--- ALL USERS READY ---');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
