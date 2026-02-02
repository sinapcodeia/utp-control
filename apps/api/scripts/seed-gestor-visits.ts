import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Iniciando carga de visitas para Gestor (Wireframe Data)...');

    try {
        // 1. Obtener Gestor y Región
        const gestor = await prisma.user.findUnique({ where: { email: 'gestor@test.com' } });
        if (!gestor) {
            console.error('Usuario gestor@test.com no encontrado.');
            return;
        }

        const region = await prisma.region.findFirst({ where: { name: 'Región Central' } })
            || await prisma.region.create({ data: { name: 'Región Central', code: 'REG-CEN' } });

        // 2. Limpiar visitas anteriores
        await prisma.visit.deleteMany({ where: { assignedToId: gestor.id } });

        // 3. Crear Visitas para coincidir con el wireframe
        // "🟢 Programadas: 6" (Asumimos que incluyen las realizadas o total del día)
        // "🟡 Pendientes: 1"
        // "🔴 Reprogramadas: 1"

        // Crear 4 Completadas (para sumar al progreso)
        for (let i = 1; i <= 4; i++) {
            await prisma.visit.create({
                data: {
                    fullName: `Unidad Productiva ${i}`,
                    addressText: `Vereda La Palma, Sector ${i}`,
                    status: 'COMPLETED',
                    priority: 'MEDIUM',
                    regionId: region.id,
                    assignedToId: gestor.id,
                    source: 'MANUAL',
                    reliability: 'HIGH',
                    verifiedAt: new Date()
                }
            });
        }

        // Crear 1 Pendiente (UP El Carmen - Wireframe Agenda)
        // Agenda: 10:30 UP El Carmen 🟡
        await prisma.visit.create({
            data: {
                fullName: 'UP El Carmen',
                addressText: 'Municipio X, Vereda El Carmen',
                status: 'PENDING',
                priority: 'MEDIUM',
                regionId: region.id,
                assignedToId: gestor.id,
                source: 'MANUAL',
                reliability: 'MEDIUM'
            }
        });

        // Crear 1 Reprogramada (UP Las Flores - Wireframe Agenda)
        // Agenda: 12:00 UP Las Flores 🔴
        // Usaremos status CANCELLED o PENDING con prioridad HIGH para simular "Reprogramada/Problema"
        await prisma.visit.create({
            data: {
                fullName: 'UP Las Flores',
                addressText: 'Municipio X, Sector Las Flores',
                status: 'PENDING', // O un estado custom si existiera, usaremos PENDING + High Priority visualmente
                priority: 'HIGH',
                regionId: region.id,
                assignedToId: gestor.id,
                source: 'MANUAL',
                reliability: 'LOW'
            }
        });

        // Crear la "Siguiente" (UP San José - Wireframe Agenda 09:00 - Ya pasó hora pero la ponemos pendiente para el demo o completada?)
        // El wireframe dice UP San José 🟢 (verde en agenda suele ser ok/realizada, pero en "Pre-Visita" aparece para iniciar).
        // Asumiremos que UP San José es la siguiente a realizar (PENDING).
        // Espera, el wireframe 3 dice:
        // 09:00 UP San José 🟢
        // 10:30 UP El Carmen 🟡
        // 12:00 UP Las Flores 🔴
        // Si San José es verde, quizas ya está lista? Pero luego el wireframe 4 dice "UP San José... [Iniciar visita]".
        // Asumiré que San José es la "Siguiente" (PENDING) y el icono verde es indicador de tipo o estado "A tiempo".

        await prisma.visit.create({
            data: {
                fullName: 'UP San José',
                addressText: 'Municipio X, Centro',
                status: 'PENDING',
                priority: 'LOW', // Verde
                regionId: region.id,
                assignedToId: gestor.id,
                source: 'MANUAL',
                reliability: 'HIGH'
            }
        });

        console.log('Visitas wireframe creadas exitosamente.');

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
