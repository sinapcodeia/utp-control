import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
    const c = await prisma.regionalReport.count({ where: { priority: 'HIGH' } });
    console.log('ALERTAS_CRITICAS:' + c);
}
run().finally(() => prisma.$disconnect());
