import { PrismaClient, ReportType, ReportFormat } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function generateTestReports() {
    try {
        // Buscar el usuario Antonio
        const user = await prisma.user.findUnique({
            where: { email: 'antonio_rburgos@msn.com' }
        });

        if (!user) {
            console.error('❌ Usuario no encontrado');
            return;
        }

        console.log(`✅ Usuario encontrado: ${user.fullName}`);

        // Generar Reporte 1: General
        const report1Code = `INF-GEN_${new Date().toISOString().split('T')[0].replace(/-/g, '')}_TEST01`;
        const report1Content = 'Reporte de prueba general del sistema';
        const report1Hash = crypto.createHash('sha256').update(report1Content).digest('hex');

        const report1 = await prisma.report.create({
            data: {
                code: report1Code,
                type: ReportType.GENERAL,
                format: ReportFormat.PDF,
                url: `/api/reports/download/${report1Code}.pdf`,
                hashSha256: report1Hash,
                generatedById: user.id,
                metadata: {
                    title: 'Informe General del Sistema',
                    description: 'Reporte de prueba con estadísticas generales',
                    stats: {
                        totalVisits: 150,
                        completedVisits: 120,
                        coverage: '80%',
                        compliance: '92%'
                    }
                }
            }
        });

        console.log(`\n📄 Reporte 1 generado:`);
        console.log(`   Código: ${report1.code}`);
        console.log(`   Tipo: ${report1.type}`);

        // Generar Reporte 2: Regional
        const report2Code = `INF-REG_${new Date().toISOString().split('T')[0].replace(/-/g, '')}_TEST02`;
        const report2Content = 'Reporte de prueba regional';
        const report2Hash = crypto.createHash('sha256').update(report2Content).digest('hex');

        // Buscar una región para el reporte regional
        const region = await prisma.region.findFirst();

        const report2 = await prisma.report.create({
            data: {
                code: report2Code,
                type: ReportType.REGIONAL,
                format: ReportFormat.PDF,
                url: `/api/reports/download/${report2Code}.pdf`,
                hashSha256: report2Hash,
                generatedById: user.id,
                regionId: region?.id,
                metadata: {
                    title: 'Informe Regional de Actividades',
                    description: 'Reporte de prueba con datos regionales',
                    region: region?.name || 'Nacional',
                    stats: {
                        totalVisits: 45,
                        completedVisits: 38,
                        coverage: '84%',
                        compliance: '95%',
                        criticalAlerts: 2,
                        preventiveAlerts: 5
                    }
                }
            }
        });

        console.log(`\n📄 Reporte 2 generado:`);
        console.log(`   Código: ${report2.code}`);
        console.log(`   Tipo: ${report2.type}`);
        console.log(`   Región: ${region?.name || 'Nacional'}`);

        // Crear logs de auditoría
        await prisma.auditLog.createMany({
            data: [
                {
                    userId: user.id,
                    action: 'GENERATE_REPORT',
                    entity: 'Report',
                    entityId: report1.id,
                    metadata: { code: report1Code, type: 'GENERAL', automated: true }
                },
                {
                    userId: user.id,
                    action: 'GENERATE_REPORT',
                    entity: 'Report',
                    entityId: report2.id,
                    metadata: { code: report2Code, type: 'REGIONAL', automated: true }
                }
            ]
        });

        console.log('\n✅ Reportes de prueba generados exitosamente');
        console.log('\n💡 Recarga la página de reportes para verlos');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

generateTestReports();
