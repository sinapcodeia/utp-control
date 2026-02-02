import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'antonio_rburgos@msn.com';
    const fullName = 'Antonio Burgos';
    const dni = '123456789'; // Placeholder, el usuario puede actualizarlo después

    // Primero, asegurémonos de que existan la región y el municipio por defecto
    let region = await prisma.region.findFirst();
    if (!region) {
        region = await prisma.region.create({
            data: {
                name: 'Región Central',
                code: 'REG-CEN',
            },
        });
    }

    let municipality = await prisma.municipality.findFirst({
        where: { regionId: region.id }
    });
    if (!municipality) {
        municipality = await prisma.municipality.create({
            data: {
                name: 'Municipio Central',
                regionId: region.id,
            },
        });
    }

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            fullName,
            role: 'ADMIN',
            isActive: true,
        },
        create: {
            email,
            fullName,
            dni,
            passwordHash: 'SUPABASE_AUTH_MANAGED',
            role: 'ADMIN',
            isActive: true,
            regionId: region.id,
            municipalityId: municipality.id,
            permissions: {
                dir: { view: true, edit: true, delete: true },
                news: { view: true, edit: true, create: true, edit_own: true, edit_all: true, delete: true },
                staff: { invite: true, manage_perms: true, block: true }
            },
            acceptedTerms: true,
            acceptedAt: new Date(),
        },
    });

    console.log('User synchronized successfully:', JSON.stringify(user, null, 2));
}

main()
    .catch((e) => {
        console.error('Error synchronizing user:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
