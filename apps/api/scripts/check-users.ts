import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- USUARIOS EN BASE DE DATOS ---');
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            fullName: true,
            role: true
        }
    });
    console.table(users);
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
