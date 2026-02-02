const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Checking auth schema access...');
        // Try to select from auth.users
        const users = await prisma.$queryRaw`SELECT id, email FROM auth.users LIMIT 5`;
        console.log('Auth Users:', JSON.stringify(users, null, 2));
    } catch (e) {
        console.error('Error accessing auth schema:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}
main();
