
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🕵️ Deep Scan of Auth Triggers & Data Parity...');

    try {
        // 1. Scan ALL Triggers in 'auth' schema
        const triggers = await prisma.$queryRawUnsafe(`
      SELECT 
        event_object_table,
        trigger_name,
        event_manipulation,
        action_statement
      FROM information_schema.triggers
      WHERE event_object_schema = 'auth';
    `) as any[];

        if (triggers.length === 0) {
            console.log('✅ No triggers found in AUTH schema.');
        } else {
            console.log(`⚠️ Found ${triggers.length} triggers in AUTH schema:`);
            triggers.forEach(t => {
                console.log(`- Table: ${t.event_object_table} | Trigger: ${t.trigger_name} [${t.event_manipulation}]`);
            });
        }

        // 2. Fix Data Parity for Coord/Gestor (Set accepted_terms = true, etc)
        console.log('🔄 Aligning public.users data...');
        await prisma.$executeRawUnsafe(`
        UPDATE public.users 
        SET accepted_terms = true, 
            accepted_at = now(),
            municipality_id = (SELECT id FROM municipalities LIMIT 1) -- Ensure they have a municipality
        WHERE email IN ('coord@test.com', 'gestor@test.com');
    `);
        console.log('✅ Users aligned.');

    } catch (error) {
        console.error('❌ Error in scan:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
