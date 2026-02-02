import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- TABLE COUNT COMPARISON ---');
        const countUser: any[] = await prisma.$queryRaw`SELECT count(*) FROM "User"`;
        const countusers: any[] = await prisma.$queryRaw`SELECT count(*) FROM users`;
        console.log('Table "User":', countUser[0].count);
        console.log('Table users:', countusers[0].count);
    } catch (error) {
        console.error('COUNT ERROR:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
