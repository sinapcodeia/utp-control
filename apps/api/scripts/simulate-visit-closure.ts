import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- SIMULACIÓN DE CIERRE DE VISITA CON ALERTA ---');

    // 1. Encontrar la visita 'UP San José'
    const visit = await prisma.visit.findFirst({
        where: { fullName: 'UP San José', status: 'PENDING' },
        include: { region: true }
    });

    if (!visit) {
        console.error('Visita "UP San José" no encontrada o ya está completada.');
        return;
    }

    const gestor = await prisma.user.findUnique({ where: { email: 'gestor@test.com' } });
    if (!gestor) return;

    console.log(`Visita encontrada: ${visit.fullName} (ID: ${visit.id})`);

    // 2. Simular Data de Cierre (Lo que vendría del Wizard Mobile)
    const closureData = {
        status: 'REALIZADA',
        unitState: 'CRITICAL',
        compliance: 'NO',
        alertType: 'CRITICA',
        alertObs: 'Riesgo de pérdida total por inundación detectada en terreno. Se requiere intervención urgente.',
        location: {
            lat: 6.2442,
            lng: -75.5812,
            accuracy: 5
        }
    };

    console.log('Enviando cierre de visita...');

    // Simulamos la lógica de TerritoryService.closeVisit directamente
    await prisma.$transaction(async (tx) => {
        // Actualizar Visita
        await tx.visit.update({
            where: { id: visit.id },
            data: {
                status: 'COMPLETED' as any,
                verifiedAt: new Date(),
                latitude: closureData.location.lat,
                longitude: closureData.location.lng,
                gpsAccuracy: closureData.location.accuracy,
                reliability: 'HIGH'
            }
        });

        // Crear Log
        await tx.visitLog.create({
            data: {
                visitId: visit.id,
                userId: gestor.id,
                action: 'CLOSURE',
                metadata: closureData
            }
        });

        // Crear Reporte Regional de Alerta
        const report = await tx.regionalReport.create({
            data: {
                userId: gestor.id,
                regionId: visit.regionId,
                municipalityId: visit.municipalityId,
                category: 'OTHER',
                priority: 'HIGH',
                title: `Alerta Crítica: ${visit.fullName}`,
                content: closureData.alertObs,
                alerts: {
                    create: {
                        priority: 'HIGH',
                        status: 'NEW'
                    }
                }
            }
        });

        console.log(`✅ Visita cerrada. Reporte de Alerta ID: ${report.id}`);
    });

    // 3. Verificar impacto en KPIs (Demo quick check)
    const criticalCount = await prisma.regionalReport.count({
        where: { priority: 'HIGH' }
    });
    console.log(`--- IMPACTO EN DASHBOARD ---`);
    console.log(`Total Alertas Críticas Actuales: ${criticalCount}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
