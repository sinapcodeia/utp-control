const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- SCHEMA CHECK ---');
        const users = await prisma.user.findMany({
            take: 5,
            include: {
                region: true,
                municipality: true
            }
        });
        console.log('Sample Users:', JSON.stringify(users, null, 2));

        const regions = await prisma.region.findMany();
        console.log('Regions:', JSON.stringify(regions, null, 2));

        const municipalities = await prisma.municipality.findMany();
        console.log('Municipalities:', JSON.stringify(municipalities, null, 2));

    } catch (e) {
        console.error('Error during debug:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
