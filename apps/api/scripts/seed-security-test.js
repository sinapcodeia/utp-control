const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding security test data...');

    // 1. Ensure Regions exist
    const regionCentral = await prisma.region.upsert({
        where: { name: 'Región Central' },
        update: {},
        create: { name: 'Región Central', code: 'REG-CEN' }
    });

    const regionNorte = await prisma.region.upsert({
        where: { name: 'Región Norte' },
        update: {},
        create: { name: 'Región Norte', code: 'REG-NOR' }
    });

    // 2. Get Users
    const admin = await prisma.user.findUnique({ where: { email: 'admin@test.com' } });
    const coord = await prisma.user.findUnique({ where: { email: 'coord@test.com' } });

    if (!admin || !coord) {
        console.error('Users not found. Run setup-users.js first.');
        return;
    }

    // 3. Create Reports in different regions
    // Reporte en Región Central (Debe ser visible para Coord)
    await prisma.regionalReport.create({
        data: {
            title: 'Reporte Central 001',
            content: 'Contenido visible para coordinador',
            category: 'SECURITY',
            priority: 'MEDIUM',
            regionId: regionCentral.id,
            userId: admin.id
        }
    });

    // Reporte en Región Norte (NO debe ser visible para Coord)
    await prisma.regionalReport.create({
        data: {
            title: 'Reporte Norte 001 (Restringido)',
            content: 'Contenido PROHIBIDO para coordinador central',
            category: 'CLIMATE',
            priority: 'HIGH',
            regionId: regionNorte.id,
            userId: admin.id
        }
    });

    // Reporte Nacional (Visible para todos)
    await prisma.regionalReport.create({
        data: {
            title: 'Reporte Nacional 001',
            content: 'Contenido público',
            category: 'OTHER',
            priority: 'LOW',
            regionId: null,
            userId: admin.id
        }
    });

    console.log('Security test data seeded.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
