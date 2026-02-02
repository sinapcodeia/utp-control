const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- RAW SQL USERS CHECK ---');
        const users = await prisma.$queryRaw`SELECT * FROM users LIMIT 5`;
        console.log('Users:', JSON.stringify(users, null, 2));

        console.log('--- TABLE LIST ---');
        const tables = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
        console.log('Tables:', JSON.stringify(tables, null, 2));

    } catch (e) {
        console.error('Error during raw query:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
