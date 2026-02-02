
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Testing database connection...');
        const userCount = await prisma.user.count();
        console.log(`User count: ${userCount}`);

        const users = await prisma.user.findMany({
            take: 5,
            include: {
                region: true
            }
        });
        console.log('Users found:', JSON.stringify(users, null, 2));
    } catch (error) {
        console.error('Database query failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
