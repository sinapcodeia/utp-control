const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!admin) {
        console.error('No admin user found. Please run users seed first.');
        return;
    }

    const doc1 = await prisma.document.create({
        data: {
            title: 'Manual de Operaciones Regionales 2026',
            url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            uploaderId: admin.id,
            comments: {
                create: [
                    {
                        content: 'Este manual ha sido actualizado con los nuevos protocolos de seguridad.',
                        userId: admin.id,
                    }
                ]
            }
        }
    });

    console.log('Seed successful: Created document', doc1.title);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
