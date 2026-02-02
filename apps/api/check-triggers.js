const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- TRIGGERS CHECK ---');
        const triggers = await prisma.$queryRaw`SELECT trigger_name, event_manipulation, event_object_table, action_statement FROM information_schema.triggers`;
        console.log('Triggers:', JSON.stringify(triggers, null, 2));
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
