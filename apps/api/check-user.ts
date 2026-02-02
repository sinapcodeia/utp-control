import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'antonio_rburgos@msn.com';
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            region: true,
            municipality: true,
        },
    });

    if (user) {
        console.log('User found:', JSON.stringify(user, null, 2));
    } else {
        console.log('User not found in public.users table');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
