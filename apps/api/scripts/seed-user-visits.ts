import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'antonio_rburgos@msn.com';
    console.log(`Checking user ${email}...`);

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        console.error('User not found');
        return;
    }

    console.log(`User found: ${user.id}. Fetching region and municipality...`);

    const region = await prisma.region.findFirst();
    const municipality = await prisma.municipality.findFirst({
        where: { regionId: region?.id }
    });

    if (!region || !municipality) {
        console.error('Region or Municipality not found');
        return;
    }

    console.log(`Region: ${region.name}, Mun: ${municipality.name}. Creating visits...`);

    const visits = [
        {
            fullName: 'UP San José',
            addressText: 'Vereda Central km 4',
            status: 'PENDING',
            priority: 'MEDIUM',
            regionId: region.id,
            municipalityId: municipality.id,
            assignedToId: user.id,
            scheduledAt: new Date(new Date().setHours(9, 0, 0, 0)),
        },
        {
            fullName: 'UP El Carmen',
            addressText: 'Sector Norte Brisas',
            status: 'PENDING',
            priority: 'HIGH',
            regionId: region.id,
            municipalityId: municipality.id,
            assignedToId: user.id,
            scheduledAt: new Date(new Date().setHours(10, 30, 0, 0)),
        },
        {
            fullName: 'UP Las Flores',
            addressText: 'Calle Principal 12-45',
            status: 'PENDING',
            priority: 'LOW',
            regionId: region.id,
            municipalityId: municipality.id,
            assignedToId: user.id,
            scheduledAt: new Date(new Date().setHours(12, 0, 0, 0)),
        }
    ];

    for (const v of visits) {
        await prisma.visit.create({ data: v as any });
    }

    console.log('✅ 3 Visits successfully assigned to user.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
