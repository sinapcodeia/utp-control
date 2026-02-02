const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- DB DIAGNOSIS v2 ---');
    try {
        const users = await prisma.user.findMany({
            select: { id: true, email: true, role: true, fullName: true }
        });
        console.log('Users in DB:');
        console.table(users);

        const visits = await prisma.visit.findMany({
            include: {
                assignedTo: { select: { email: true } }
            }
        });
        console.log('\nVisits in DB:');
        console.log(visits.map(v => ({
            id: v.id,
            fullName: v.fullName,
            assignedTo: v.assignedTo?.email || 'UNASSIGNED',
            status: v.status,
            scheduledAt: v.scheduledAt
        })));
    } catch (e) {
        console.error('DIAGNOSIS ERROR:', e.message);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
