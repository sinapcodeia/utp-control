import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'antonio_rburgos@msn.com';
    console.log(`Updating role for ${email}...`);

    const user = await prisma.user.update({
        where: { email },
        data: { role: 'GESTOR' as any },
    });

    console.log('Update successful:', user);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
