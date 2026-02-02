import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Iniciando corrección de datos para Coordinador...');

    try {
        // 1. Obtener IDs
        const region = await prisma.region.findUnique({ where: { name: 'Región Central' } })
            || await prisma.region.create({ data: { name: 'Región Central', code: 'REG-CEN' } });

        const coordinator = await prisma.user.findUnique({ where: { email: 'coord@test.com' } });

        if (!coordinator) {
            console.error('Usuario coordinador no encontrado');
            return;
        }

        // 2. Asignar Región (Raw SQL para tabla implícita)
        await prisma.$executeRaw`
      INSERT INTO "_UserAssignedRegions" ("A", "B")
      VALUES (${region.id}, ${coordinator.id})
      ON CONFLICT DO NOTHING;
    `;
        console.log('Región asignada al coordinador.');

        // 3. Crear Reportes
        await prisma.regionalReport.create({
            data: {
                userId: coordinator.id,
                regionId: region.id,
                category: 'SECURITY',
                priority: 'HIGH',
                title: 'Alerta de Seguridad',
                content: 'Bloqueo en vía principal: Se reporta manifestación pacífica.',
                alerts: {
                    create: {
                        priority: 'HIGH',
                        status: 'NEW'
                    }
                }
            }
        });
        console.log('Reporte de seguridad creado.');

        // 4. Actualizar usuarios
        await prisma.user.updateMany({
            where: { email: { in: ['gestor@test.com', 'admin@test.com'] } },
            data: { regionId: region.id }
        });
        console.log('Usuarios asignados a la región.');

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
