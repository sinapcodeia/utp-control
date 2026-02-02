import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- COLUMN LIST (User) ---');
        const columns: any[] = await prisma.$queryRaw`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'User'
        `;
        columns.forEach(c => console.log(`- ${c.column_name} (${c.data_type})`));
    } catch (error) {
        console.error('COLUMN LIST ERROR:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
