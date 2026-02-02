const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- SIMPLE USER CHECK ---');
        const users = await prisma.user.findMany({ take: 5 });
        console.log('Users:', JSON.stringify(users, null, 2));

        console.log('--- REGION CHECK ---');
        const regions = await prisma.region.findMany({ take: 5 });
        console.log('Regions:', JSON.stringify(regions, null, 2));

    } catch (e) {
        console.error('Error during debug:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
