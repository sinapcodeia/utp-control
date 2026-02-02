
import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();
    try {
        console.log('Adding missing columns to regional_reports...');

        await prisma.$executeRaw`ALTER TABLE regional_reports ADD COLUMN IF NOT EXISTS location_manual_region TEXT;`;
        await prisma.$executeRaw`ALTER TABLE regional_reports ADD COLUMN IF NOT EXISTS location_manual_department TEXT;`;
        await prisma.$executeRaw`ALTER TABLE regional_reports ADD COLUMN IF NOT EXISTS location_manual_municipality TEXT;`;

        console.log('Columns added successfully.');

        // Also check the documents table as I saw a previous error about missing region_id in documents
        console.log('Adding missing columns to documents...');
        await prisma.$executeRaw`ALTER TABLE documents ADD COLUMN IF NOT EXISTS region_id TEXT;`;

        console.log('Migration completed.');
    } catch (e) {
        console.error('Error during migration:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
