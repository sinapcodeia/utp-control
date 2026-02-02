import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Diagnostincando esquema de base de datos...');

    try {
        // 1. Intentar corregir la falta de la columna 'title'
        try {
            // Verificamos si podemos seleccionar 'title' (esto fallará si no existe, pero es difícil de capturar con Prisma raw typed)
            // Mejor estrategia: Intentar añadir la columna. Si ya existe, fallará, pero podemos capturar eso o usar IF NOT EXISTS (Postgres 9.6+ no soporta IF NOT EXISTS en ADD COLUMN directamente de forma simple sin bloque DO)

            console.log('Intentando añadir columna "title" a regional_reports...');
            await prisma.$executeRawUnsafe(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='regional_reports' AND column_name='title') THEN 
                    ALTER TABLE regional_reports ADD COLUMN title TEXT NOT NULL DEFAULT 'Aviso General'; 
                END IF; 
            END $$;
        `);
            console.log('Esquema corregido (o ya estaba correcto).');
        } catch (e) {
            console.warn('Advertencia al intentar alterar la tabla:', e.message);
        }

        // 2. Continuar con la inserción de datos (Lógica del seed anterior)
        console.log('Insertando datos de prueba...');

        const region = await prisma.region.findUnique({ where: { name: 'Región Central' } })
            || await prisma.region.create({ data: { name: 'Región Central', code: 'REG-CEN' } });

        const coordinator = await prisma.user.findUnique({ where: { email: 'coord@test.com' } });

        if (coordinator) {
            // Asignar Región
            await prisma.$executeRaw`
            INSERT INTO "_UserAssignedRegions" ("A", "B")
            VALUES (${region.id}, ${coordinator.id})
            ON CONFLICT DO NOTHING;
        `;

            // Crear Reporte
            // Usamos create de Prisma ahora que la columna debería existir
            const reportCount = await prisma.regionalReport.count({ where: { title: 'Alerta de Seguridad' } });

            if (reportCount === 0) {
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
            } else {
                console.log('El reporte de prueba ya existe.');
            }

            // Actualizar usuarios
            await prisma.user.updateMany({
                where: { email: { in: ['gestor@test.com', 'admin@test.com'] } },
                data: { regionId: region.id }
            });
            console.log('Usuarios asignados.');
        } else {
            console.error('Usuario coordinador no encontrado. Asegúrate de que los usuarios base existan.');
        }

    } catch (e) {
        console.error('Error crítico:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
