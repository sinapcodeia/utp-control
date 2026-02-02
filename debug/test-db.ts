import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Testing DB connection...');
        const userCount = await prisma.user.count();
        console.log(`User count: ${userCount}`);

        const users = await prisma.user.findMany({
            take: 1,
            include: {
                region: true,
                assignedRegions: true,
                assignedMunicipalities: true,
                assignedVeredas: true,
            }
        });
        console.log('First user:', JSON.stringify(users[0], null, 2));
    } catch (e) {
        console.error('Error during test:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
