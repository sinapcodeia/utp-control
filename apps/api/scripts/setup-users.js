const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function getEnvVars() {
    const envPath = path.join(__dirname, '../../../apps/web/.env.local');
    try {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const envVars = {};
        envContent.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const value = parts.slice(1).join('=').trim().replace(/"/g, '');
                envVars[key] = value;
            }
        });
        return envVars;
    } catch (error) {
        console.error('Error reading .env.local:', error);
        return {};
    }
}

const env = getEnvVars();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const users = [
    { email: 'admin@test.com', password: 'UTPControl2026!', role: 'ADMIN', name: 'Admin Test' },
    { email: 'coord@test.com', password: 'UTPControl2026!', role: 'COORDINATOR', name: 'Coord Test' },
    { email: 'gestor@test.com', password: 'UTPControl2026!', role: 'USER', name: 'Gestor Test' },
];

async function main() {
    console.log('Starting user setup...');

    for (const user of users) {
        console.log(`Processing ${user.email}...`);

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
            console.log(`Error signing up ${user.email}:`, error.message);
        } else {
            console.log(`Signed up ${user.email} successfully.`);
        }

        await new Promise(resolve => setTimeout(resolve, 2000));

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
                const region = await prisma.region.findFirst({ where: { name: 'Región Central' } });
                regionId = region?.id;
                permissions = {
                    dir: { view: true, edit: false, delete: false },
                    news: { view: true, edit: false, create: false, edit_own: false, edit_all: false, delete: false },
                    staff: { invite: false, manage_perms: false, block: false },
                    territory: { allRegions: false, regions: [] }
                };
            }

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
        } catch (dbError) {
            console.error(`Error updating DB for ${user.email}:`, dbError.message);
        }
    }

    console.log('Setup complete.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
