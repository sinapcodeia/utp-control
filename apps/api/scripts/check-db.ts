
import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();
    try {
        const columns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'regional_reports';
    `;
        console.log('Columns in regional_reports:', columns);
    } catch (e) {
        console.error('Error checking columns:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
