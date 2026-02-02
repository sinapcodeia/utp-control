import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const targetEmail = 'antoniorodriguezutep@gmail.com';
    console.log(`Checking target user ${targetEmail}...`);

    const targetUser = await prisma.user.findUnique({
        where: { email: targetEmail },
    });

    if (!targetUser) {
        console.error(`Target user ${targetEmail} not found`);
        return;
    }

    // IDs from seed-data.sql
    const regionId = 'REG-ANT-001';
    const municipalityId = 'MUN-MED-001';

    console.log(`Target User found: ${targetUser.id}. Cleaning old visits...`);

    await prisma.visit.deleteMany({
        where: { assignedToId: targetUser.id }
    });

    console.log(`Creating new visits (bypassing TS for new field scheduledAt)...`);

    const visits = [
        {
            fullName: 'UP San José (Campo)',
            addressText: 'Vereda Central km 4',
            status: 'PENDING',
            priority: 'MEDIUM',
            regionId: regionId,
            municipalityId: municipalityId,
            assignedToId: targetUser.id,
            scheduledAt: new Date(new Date().setHours(9, 0, 0, 0)),
        },
        {
            fullName: 'UP El Carmen (Operativo)',
            addressText: 'Sector Norte Brisas',
            status: 'PENDING',
            priority: 'HIGH',
            regionId: regionId,
            municipalityId: municipalityId,
            assignedToId: targetUser.id,
            scheduledAt: new Date(new Date().setHours(10, 30, 0, 0)),
        },
        {
            fullName: 'UP Las Flores (Ruta)',
            addressText: 'Calle Principal 12-45',
            status: 'PENDING',
            priority: 'LOW',
            regionId: regionId,
            municipalityId: municipalityId,
            assignedToId: targetUser.id,
            scheduledAt: new Date(new Date().setHours(12, 0, 0, 0)),
        }
    ];

    for (const v of visits) {
        await prisma.visit.create({
            data: v as any
        });
    }

    console.log(`✅ 3 Visits successfully assigned to ${targetEmail}.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
