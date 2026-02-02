
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const roles = await prisma.$queryRaw`
      SELECT enumlabel FROM pg_enum 
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'Role')
    `;
        console.log(JSON.stringify(roles, null, 2));
    } catch (e: any) {
        console.error(e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
