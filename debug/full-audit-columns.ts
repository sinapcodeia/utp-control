import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- FULL COLUMN AUDIT (users) ---');
        const columns: any[] = await prisma.$queryRaw`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users'
            ORDER BY column_name
        `;
        columns.forEach(c => console.log(`- ${c.column_name}`));
    } catch (error) {
        console.error('AUDIT ERROR:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
