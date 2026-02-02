
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🛡️ Fixing Permissions & Triggers...');

    try {
        // 1. GRANT Permissions (Sequential Calls)
        console.log('Granting schema permissions...');
        await prisma.$executeRawUnsafe(`GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role`);
        await prisma.$executeRawUnsafe(`GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role`);
        await prisma.$executeRawUnsafe(`GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role`);
        await prisma.$executeRawUnsafe(`GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role`);

        await prisma.$executeRawUnsafe(`GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated`);
        await prisma.$executeRawUnsafe(`GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon`);

        // 2. Inspect Triggers on auth.users
        console.log('Inspecting auth.users triggers...');
        const triggers = await prisma.$queryRawUnsafe<any[]>(`
      SELECT trigger_name, event_manipulation, action_statement 
      FROM information_schema.triggers 
      WHERE event_object_table = 'users' AND event_object_schema = 'auth';
    `);

        console.log('Found triggers:', triggers.map(t => `${t.trigger_name} (${t.event_manipulation})`));

        // 3. Drop suspicious triggers (Only keep the one we know: on_auth_user_created for INSERT)
        // If there is a trigger on UPDATE that drives the sync, it might crash login if the public user doesn't exist?
        // Let's safe-guard: Only allow INSERT trigger.

        for (const t of triggers) {
            if (t.event_manipulation === 'UPDATE' || t.event_manipulation === 'DELETE') {
                console.log(`⚠️ Dropping risky trigger: ${t.trigger_name}`);
                await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS "${t.trigger_name}" ON auth.users;`);
            }
        }

        console.log('✅ Permissions applied & Risky triggers removed.');

    } catch (error) {
        console.error('❌ Error fixing permissions:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
