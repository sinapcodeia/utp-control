const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.$queryRaw`SELECT COUNT(*) FROM users`;
        console.log('Total Users:', count);

        const allUsers = await prisma.$queryRaw`SELECT email, full_name, role FROM users`;
        console.log('All Users:', JSON.stringify(allUsers, null, 2));
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
