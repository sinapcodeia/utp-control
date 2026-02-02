import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- DB AUDIT ---');
        const userCount = await prisma.user.count();
        const regionCount = await prisma.region.count();
        console.log('Users:', userCount);
        console.log('Regions:', regionCount);

        const usersWithRegions = await prisma.user.findMany({
            take: 20,
            select: {
                id: true,
                email: true,
            }
        });

        console.log('Sample Users:');
        usersWithRegions.forEach(u => {
            console.log(`- ${u.email} (ID=${u.id})`);
        });

        const regions = await prisma.region.findMany({ take: 5 });
        console.log('Sample Regions:');
        regions.forEach(r => {
            console.log(`- ${r.name} (ID=${r.id})`);
        });

    } catch (error) {
        console.error('AUDIT ERROR:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
