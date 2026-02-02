const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- ALL USER EMAILS ---');
        const emails = await prisma.$queryRaw`SELECT email FROM users`;
        console.log('Emails:', JSON.stringify(emails, null, 2));
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
