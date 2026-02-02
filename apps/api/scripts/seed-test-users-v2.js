const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = [
        {
            email: 'admin@test.com',
            name: 'Admin de Prueba',
            dni: 'TEST-ADMIN-001',
            role: 'ADMIN',
            region_id: null,
            permissions: {
                dir: { view: true, edit: true, delete: true },
                news: { view: true, edit: true, create: true, edit_own: true, edit_all: true, delete: true },
                staff: { invite: true, manage_perms: true, block: true },
                territory: { allRegions: true, regions: [] }
            }
        },
        {
            email: 'coord@test.com',
            name: 'Coordinador Multi-Región',
            dni: 'TEST-COORD-001',
            role: 'COORDINATOR',
            region_id: null, // Will fetch
            permissions: {
                dir: { view: true, edit: true, delete: false },
                news: { view: true, edit: true, create: true, edit_own: true, edit_all: false, delete: true },
                staff: { invite: true, manage_perms: false, block: false },
                territory: { allRegions: false, regions: [] }
            }
        },
        {
            email: 'gestor@test.com',
            name: 'Gestor de Prueba',
            dni: 'TEST-GESTOR-001',
            role: 'USER',
            region_id: null, // Will fetch
            permissions: {
                dir: { view: true, edit: false, delete: false },
                news: { view: true, edit: false, create: false, edit_own: false, edit_all: false, delete: false },
                staff: { invite: false, manage_perms: false, block: false },
                territory: { allRegions: false, regions: [] }
            }
        }
    ];

    try {
        console.log('Starting Test User Seed (V2) - Auth & Public Sync...');

        // 1. Get Region ID for Coordinator/Gestor
        const centralRegion = await prisma.region.findFirst({ where: { name: 'Región Central' } });
        const regionId = centralRegion ? centralRegion.id : null;

        for (const u of users) {
            console.log(`Processing ${u.email}...`);

            // Clean existing
            try {
                // Clean dependencies (Cascade Delete Simulation)
                const userIdQuery = `(SELECT id FROM public.users WHERE email = '${u.email}')`;

                // 1. Alerts & Receipts (depend on Regional Reports)
                await prisma.$executeRawUnsafe(`DELETE FROM "alerts" WHERE "report_id" IN (SELECT id FROM "regional_reports" WHERE "user_id" IN ${userIdQuery})`);
                await prisma.$executeRawUnsafe(`DELETE FROM "news_read_receipts" WHERE "report_id" IN (SELECT id FROM "regional_reports" WHERE "user_id" IN ${userIdQuery})`);
                await prisma.$executeRawUnsafe(`DELETE FROM "news_read_receipts" WHERE "user_id" IN ${userIdQuery}`);

                // 2. Regional Reports
                await prisma.$executeRawUnsafe(`DELETE FROM "regional_reports" WHERE "user_id" IN ${userIdQuery}`);

                // 3. Deliveries & Reports
                await prisma.$executeRawUnsafe(`DELETE FROM "report_deliveries" WHERE "report_id" IN (SELECT id FROM "reports" WHERE "generated_by" IN ${userIdQuery})`);
                await prisma.$executeRawUnsafe(`DELETE FROM "reports" WHERE "generated_by" IN ${userIdQuery}`);
                await prisma.$executeRawUnsafe(`DELETE FROM "reports" WHERE "authorized_by" IN ${userIdQuery}`);

                // 4. Visits & Logs
                await prisma.$executeRawUnsafe(`DELETE FROM "visit_logs" WHERE "user_id" IN ${userIdQuery}`);
                await prisma.$executeRawUnsafe(`DELETE FROM "visits" WHERE "assigned_to" IN ${userIdQuery} OR "assigned_by" IN ${userIdQuery}`);

                // 5. Documents & Comments
                await prisma.$executeRawUnsafe(`DELETE FROM "document_comments" WHERE "user_id" IN ${userIdQuery}`);
                await prisma.$executeRawUnsafe(`DELETE FROM "documents" WHERE "uploader_id" IN ${userIdQuery}`);

                // 6. Audit Logs
                await prisma.$executeRawUnsafe(`DELETE FROM "audit_logs" WHERE "user_id" IN ${userIdQuery}`);

                // 7. Link Tables
                try { await prisma.$executeRawUnsafe(`DELETE FROM "_UserAssignedRegions" WHERE "B" IN ${userIdQuery}`); } catch (e) { }
                try { await prisma.$executeRawUnsafe(`DELETE FROM "_UserAssignedMunicipalities" WHERE "B" IN ${userIdQuery}`); } catch (e) { }

                // 8. Delete Users
                const verifyDel = await prisma.$executeRawUnsafe(`DELETE FROM public.users WHERE email = '${u.email}'`);
                console.log(`Deleted public user ${u.email}: ${verifyDel}`);

                const verifyDelAuth = await prisma.$executeRawUnsafe(`DELETE FROM auth.users WHERE email = '${u.email}'`);
                console.log(`Deleted auth user ${u.email}: ${verifyDelAuth}`);
            } catch (err) {
                console.error(`Error cleaning user ${u.email}:`, err.message);
            }

            // Create in Auth
            try {
                await prisma.$executeRawUnsafe(`
                INSERT INTO auth.users (
                    instance_id,
                    id,
                    aud,
                    role,
                    email,
                    encrypted_password,
                    email_confirmed_at,
                    raw_user_meta_data,
                    created_at,
                    updated_at
                ) VALUES (
                    '00000000-0000-0000-0000-000000000000',
                    gen_random_uuid(),
                    'authenticated',
                    'authenticated',
                    '${u.email}',
                    extensions.crypt('UTPControl2026!', extensions.gen_salt('bf')),
                    now(),
                    '{"full_name": "${u.name}", "dni": "${u.dni}"}',
                    now(),
                    now()
                )
            `);

                // Wait for trigger to fire (usually immediate in same transaction, but here they are separate commands).
                // However, since we are using explicit ExecuteRaw, the trigger runs on DB side.
                // We need to wait a ms or just update public.users immediately.

                // Check if user exists in public
                const check = await prisma.user.findUnique({ where: { email: u.email } });
                if (!check) {
                    console.error(`Trigger did not fire for ${u.email}!`);
                    continue;
                }

                // Update Public User with Role and Permissions
                const updateData = {
                    role: u.role,
                    permissions: u.permissions
                };

                // Connect region if applicable
                if ((u.role === 'COORDINATOR' || u.role === 'USER') && regionId) {
                    updateData.region = { connect: { id: regionId } };
                }

                await prisma.user.update({
                    where: { email: u.email },
                    data: updateData
                });

                console.log(`✅ Success: ${u.email}`);
            } catch (err) {
                console.error(`Failed to create/update auth user ${u.email}:`, err.message);
            }
        }
    } catch (e) {
        console.error('Error during seeding:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
