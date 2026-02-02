const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Intentar leer variables de entorno de varios lugares
function getEnvVars() {
    const paths = [
        path.join(__dirname, '../../../apps/web/.env.local'),
        path.join(__dirname, '../../../apps/api/.env'),
        path.join(__dirname, '../../../.env')
    ];

    const envVars = {};

    paths.forEach(p => {
        try {
            if (fs.existsSync(p)) {
                const content = fs.readFileSync(p, 'utf-8');
                content.split('\n').forEach(line => {
                    const parts = line.split('=');
                    if (parts.length >= 2) {
                        const key = parts[0].trim();
                        const value = parts.slice(1).join('=').trim().replace(/"/g, '');
                        envVars[key] = value;
                    }
                });
            }
        } catch (e) { }
    });

    return envVars;
}

const env = getEnvVars();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
// Preferir Service Role Key si existe, sino Anon Key
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.SUPABASE_KEY;

console.log('Using Supabase URL:', supabaseUrl);
console.log('Using Key Type:', env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE' : 'ANON/PUBLIC');

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const users = [
    { email: 'admin@test.com', password: 'UTPControl2026!', role: 'ADMIN', name: 'Admin Test' },
    { email: 'coord@test.com', password: 'UTPControl2026!', role: 'COORDINATOR', name: 'Coord Test' },
    { email: 'gestor@test.com', password: 'UTPControl2026!', role: 'USER', name: 'Gestor Test' },
];

async function main() {
    console.log('Starting ROBUST user setup...');

    for (const user of users) {
        console.log(`\nProcessing ${user.email}...`);

        // 1. Try to delete user first (only works with Service Role)
        if (env.SUPABASE_SERVICE_ROLE_KEY) {
            const { data: listData } = await supabase.auth.admin.listUsers();
            const existing = listData?.users.find(u => u.email === user.email);
            if (existing) {
                await supabase.auth.admin.deleteUser(existing.id);
                console.log('Deleted existing user (clean slate).');
            }

            const { data, error } = await supabase.auth.admin.createUser({
                email: user.email,
                password: user.password,
                email_confirm: true,
                user_metadata: {
                    full_name: user.name,
                    accepted_terms: true,
                    accepted_at: new Date().toISOString(),
                }
            });

            if (error) console.error('Admin Create Error:', error.message);
            else console.log('Created confirmed user via Admin API.');

        } else {
            // Fallback to regular SignUp
            const { data, error } = await supabase.auth.signUp({
                email: user.email,
                password: user.password,
                options: {
                    data: {
                        full_name: user.name,
                        accepted_terms: true,
                        accepted_at: new Date().toISOString(),
                    },
                },
            });

            if (error) {
                console.log(`SignUp Error: ${error.message}`);
            } else {
                console.log(`SignUp Success. ID: ${data.user?.id}`);
                if (data.session) {
                    console.log('Session created (Auto-confirm likely ON).');
                } else {
                    console.log('WARNING: No session created. Email confirmation might be required.');
                }
            }
        }

        // 2. Update DB Permissions
        try {
            // Wait for trigger
            await new Promise(resolve => setTimeout(resolve, 2000));

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
                const region = await prisma.region.findFirst({ where: { name: 'Región Central' } });
                regionId = region?.id;
                permissions = {
                    dir: { view: true, edit: false, delete: false },
                    news: { view: true, edit: false, create: false, edit_own: false, edit_all: false, delete: false },
                    staff: { invite: false, manage_perms: false, block: false },
                    territory: { allRegions: false, regions: [] }
                };
            }

            // Upsert to ensure it exists in public.users even if trigger failed
            const existingUser = await prisma.user.findUnique({ where: { email: user.email } });
            if (existingUser) {
                await prisma.user.update({
                    where: { email: user.email },
                    data: {
                        role: user.role,
                        permissions: permissions,
                        regionId: regionId,
                        isActive: true,
                        acceptedTerms: true,
                    },
                });
                console.log(`Updated permissions for ${user.email}`);
            } else {
                console.error(`User ${user.email} NOT FOUND in public.users. Trigger might have failed.`);
            }

        } catch (dbError) {
            console.error(`Error updating DB for ${user.email}:`, dbError.message);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
