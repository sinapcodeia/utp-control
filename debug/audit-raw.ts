import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- RAW PERMISSIONS AUDIT ---');
        const rawUsers = await prisma.$queryRaw`SELECT id, email, permissions FROM users LIMIT 10`;
        console.log(JSON.stringify(rawUsers, null, 2));
    } catch (error) {
        console.error('RAW AUDIT ERROR:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
