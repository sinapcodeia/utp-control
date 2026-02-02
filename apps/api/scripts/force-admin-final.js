const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Clave proporcionada por el usuario
const SERVICE_KEY = 'sb_secret_mi2hJTvLZ9i9xSy5Q9bmyQ_JY5PaLg1';
// URL CORREGIDA (juq en lugar de jug)
const SUPABASE_URL = 'https://mhaqatbmjuqdodaczlmc.supabase.co';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function main() {
    const email = 'admin@test.com';
    const password = 'UTPControl2026!';

    console.log(`\n--- FORCE CREATING ADMIN USER ---`);
    console.log(`Target: ${email}`);
    console.log(`URL: ${SUPABASE_URL}`);

    // 1. Clean up existing user in Auth
    const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
        console.error('CRITICAL: Could not list users.', listError.message);
        process.exit(1);
    }

    const existing = listData.users.find(u => u.email === email);
    if (existing) {
        console.log(`Found existing Auth user ${existing.id}. Deleting...`);
        await supabase.auth.admin.deleteUser(existing.id);
        console.log('Deleted from Auth.');
    }

    // 2. Create new user with auto-confirm
    console.log('Creating new user...');
    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            full_name: 'Admin Test Forced',
            accepted_terms: true,
            accepted_at: new Date().toISOString()
        }
    });

    if (error) {
        console.error('Create Failed:', error.message);
        process.exit(1);
    }

    console.log(`User created successfully! ID: ${data.user.id}`);

    // 3. Update Permissions in DB
    console.log('Updating database permissions...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
        const permissions = {
            dir: { view: true, edit: true, delete: true },
            news: { view: true, edit: true, create: true, edit_own: true, edit_all: true, delete: true },
            staff: { invite: true, manage_perms: true, block: true },
            territory: { allRegions: true, regions: [] }
        };

        let dbUser = await prisma.user.findUnique({ where: { email } });

        if (!dbUser) {
            console.log('Trigger lag detected. Inserting manually into public.users...');
            await prisma.user.create({
                data: {
                    id: data.user.id,
                    email: email,
                    fullName: 'Admin Test Forced',
                    passwordHash: 'SUPABASE_AUTH_MANAGED',
                    dni: 'ADM-FORCE',
                    role: 'ADMIN',
                    permissions: permissions,
                    isActive: true,
                    acceptedTerms: true
                }
            });
        } else {
            console.log('User found in DB. Updating role/permissions...');
            await prisma.user.update({
                where: { email },
                data: {
                    role: 'ADMIN',
                    permissions: permissions,
                    isActive: true,
                    acceptedTerms: true
                }
            });
        }
        console.log('Database sync complete.');

    } catch (e) {
        console.error('DB Update Error:', e.message);
    }

    console.log('\n--- SUCCESS! You can now login as admin@test.com ---');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
