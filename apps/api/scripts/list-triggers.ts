
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🕵️ Listing Triggers on auth.users...');

    try {
        // Query to find triggers on auth.users
        const triggers = await prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        trigger_name,
        event_manipulation,
        action_statement
      FROM information_schema.triggers
      WHERE event_object_schema = 'auth'
        AND event_object_table = 'users';
    `);

        if (triggers.length === 0) {
            console.log('✅ No triggers found on auth.users.');
        } else {
            console.log(`⚠️ Found ${triggers.length} triggers:`);
            triggers.forEach(t => {
                console.log(`- [${t.event_manipulation}] ${t.trigger_name}`);
            });
        }

    } catch (error) {
        console.error('❌ Error listing triggers:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
