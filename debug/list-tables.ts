import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- TABLE LIST ---');
        const tables: any[] = await prisma.$queryRaw`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'`;
        tables.forEach(t => console.log(`- ${t.tablename}`));
    } catch (error) {
        console.error('TABLE LIST ERROR:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
