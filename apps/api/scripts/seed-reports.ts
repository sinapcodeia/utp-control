import { PrismaClient, ReportType, ReportFormat, Report } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * Script para poblar la bóveda de informes
 * Ejecutar con: npx ts-node apps/api/scripts/seed-reports.ts
 */

async function main() {
    console.log('🚀 Iniciando población de informes...\n');

    // ============================================================================
    // PASO 1: OBTENER REFERENCIAS
    // ============================================================================

    console.log('📋 Obteniendo referencias de usuarios y regiones...');

    const admin = await prisma.user.findFirst({
        where: { role: 'ADMIN' }
    });

    const coordinator = await prisma.user.findFirst({
        where: { role: 'COORDINATOR' }
    });

    const regions = await prisma.region.findMany({
        include: { municipalities: true }
    });

    if (!admin) {
        throw new Error('❌ No se encontró usuario ADMIN. Ejecuta seed-data.ts primero.');
    }

    console.log(`✅ Admin encontrado: ${admin.fullName || admin.email}`);
    console.log(`✅ Regiones encontradas: ${regions.length}\n`);

    // ============================================================================
    // PASO 2: CREAR INFORMES REGIONALES
    // ============================================================================

    console.log('📊 Creando informes regionales...\n');

    const regionalReports: Report[] = [];

    for (const region of regions) {
        const municipality = region.municipalities[0];

        const report = await prisma.report.create({
            data: {
                code: `INF-REG-${region.code}-2026-01-${String(regionalReports.length + 1).padStart(4, '0')}`,
                type: ReportType.REGIONAL,
                format: ReportFormat.PDF,
                url: `https://storage.utpcontrol.com/reports/regional/${region.code.toLowerCase()}-enero-2026.pdf`,
                hashSha256: crypto.createHash('sha256')
                    .update(`regional-${region.code}-enero-2026`)
                    .digest('hex'),
                generatedById: admin.id,
                regionId: region.id,
                municipalityId: municipality?.id || null,
                metadata: {
                    visibility: 'PUBLIC',
                    period: 'ENERO 2026',
                    category: 'MENSUAL',
                    summary: `Informe mensual de gestión territorial ${region.name}`,
                    metrics: {
                        visitas_realizadas: Math.floor(Math.random() * 200) + 150,
                        cobertura: `${Math.floor(Math.random() * 20) + 80}%`,
                        alertas_criticas: Math.floor(Math.random() * 5),
                        cumplimiento: `${Math.floor(Math.random() * 10) + 90}%`
                    }
                }
            }
        });

        regionalReports.push(report);
        console.log(`  ✅ ${report.code} - ${region.name}`);
    }

    console.log(`\n✅ ${regionalReports.length} informes regionales creados\n`);

    // ============================================================================
    // PASO 3: CREAR INFORMES DE AUDITORÍA
    // ============================================================================

    console.log('🔒 Creando informes de auditoría...\n');

    const auditReports: Report[] = [];

    // Auditoría de Seguridad
    const securityAudit = await prisma.report.create({
        data: {
            code: `INF-AUD-SYS-2026-01-${String(auditReports.length + 1).padStart(4, '0')}`,
            type: ReportType.AUDIT,
            format: ReportFormat.PDF,
            url: 'https://storage.utpcontrol.com/reports/audit/sistema-enero-2026.pdf',
            hashSha256: crypto.createHash('sha256')
                .update('audit-sistema-enero-2026')
                .digest('hex'),
            generatedById: admin.id,
            regionId: null, // Nacional
            municipalityId: null,
            metadata: {
                visibility: 'RESTRICTED',
                period: 'ENERO 2026',
                category: 'SEGURIDAD',
                summary: 'Auditoría de seguridad y accesos del sistema',
                findings: [
                    'Accesos no autorizados: 0',
                    'Intentos de login fallidos: 12',
                    'Cambios de permisos: 5',
                    'Exportaciones de datos: 23'
                ],
                recommendations: [
                    'Implementar 2FA para usuarios ADMIN',
                    'Revisar permisos de usuarios COORDINATOR',
                    'Actualizar políticas de contraseñas'
                ]
            }
        }
    });

    auditReports.push(securityAudit);
    console.log(`  ✅ ${securityAudit.code} - Auditoría de Seguridad`);

    // Auditoría de Cumplimiento
    const complianceAudit = await prisma.report.create({
        data: {
            code: `INF-AUD-CMP-2026-01-${String(auditReports.length + 1).padStart(4, '0')}`,
            type: ReportType.AUDIT,
            format: ReportFormat.PDF,
            url: 'https://storage.utpcontrol.com/reports/audit/cumplimiento-enero-2026.pdf',
            hashSha256: crypto.createHash('sha256')
                .update('audit-cumplimiento-enero-2026')
                .digest('hex'),
            generatedById: admin.id,
            regionId: null,
            municipalityId: null,
            metadata: {
                visibility: 'RESTRICTED',
                period: 'ENERO 2026',
                category: 'CUMPLIMIENTO',
                summary: 'Auditoría de cumplimiento normativo ISO 27001',
                compliance_score: 94,
                areas_reviewed: [
                    'Gestión de Accesos',
                    'Protección de Datos',
                    'Continuidad del Negocio',
                    'Gestión de Incidentes'
                ]
            }
        }
    });

    auditReports.push(complianceAudit);
    console.log(`  ✅ ${complianceAudit.code} - Auditoría de Cumplimiento`);

    console.log(`\n✅ ${auditReports.length} informes de auditoría creados\n`);

    // ============================================================================
    // PASO 4: CREAR INFORMES GENERALES
    // ============================================================================

    console.log('📈 Creando informes generales...\n');

    const generalReports: Report[] = [];

    // Consolidado Nacional
    const nationalReport = await prisma.report.create({
        data: {
            code: `INF-GEN-NAC-2026-01-${String(generalReports.length + 1).padStart(4, '0')}`,
            type: ReportType.GENERAL,
            format: ReportFormat.PDF,
            url: 'https://storage.utpcontrol.com/reports/general/consolidado-nacional-enero-2026.pdf',
            hashSha256: crypto.createHash('sha256')
                .update('general-nacional-enero-2026')
                .digest('hex'),
            generatedById: admin.id,
            regionId: null,
            municipalityId: null,
            metadata: {
                visibility: 'PUBLIC',
                period: 'ENERO 2026',
                category: 'CONSOLIDADO',
                summary: 'Informe consolidado nacional de gestión territorial',
                metrics: {
                    total_visitas: 755,
                    cobertura_nacional: '87%',
                    regiones_activas: regions.length,
                    alertas_criticas_total: 10,
                    cumplimiento_promedio: '93%'
                },
                highlights: [
                    'Incremento del 12% en cobertura vs mes anterior',
                    'Reducción del 8% en alertas críticas',
                    'Mejora del 5% en cumplimiento de objetivos'
                ]
            }
        }
    });

    generalReports.push(nationalReport);
    console.log(`  ✅ ${nationalReport.code} - Consolidado Nacional`);

    // KPIs
    const kpiReport = await prisma.report.create({
        data: {
            code: `INF-GEN-KPI-2026-01-${String(generalReports.length + 1).padStart(4, '0')}`,
            type: ReportType.GENERAL,
            format: ReportFormat.XLSX,
            url: 'https://storage.utpcontrol.com/reports/general/kpi-enero-2026.xlsx',
            hashSha256: crypto.createHash('sha256')
                .update('general-kpi-enero-2026')
                .digest('hex'),
            generatedById: admin.id,
            regionId: null,
            municipalityId: null,
            metadata: {
                visibility: 'PUBLIC',
                period: 'ENERO 2026',
                category: 'KPI',
                summary: 'Indicadores clave de desempeño nacional',
                kpis: {
                    tiempo_respuesta_promedio: '2.3 horas',
                    satisfaccion_ciudadana: '4.2/5',
                    eficiencia_operativa: '91%',
                    tasa_resolucion: '87%'
                }
            }
        }
    });

    generalReports.push(kpiReport);
    console.log(`  ✅ ${kpiReport.code} - KPIs Nacionales`);

    console.log(`\n✅ ${generalReports.length} informes generales creados\n`);

    // ============================================================================
    // PASO 5: CREAR INFORMES DE ALERTAS
    // ============================================================================

    console.log('⚠️  Creando informes de alertas...\n');

    const alertReports: Report[] = [];

    if (coordinator && regions.length > 0) {
        const region = regions[0];
        const municipality = region.municipalities[0];

        const alertReport = await prisma.report.create({
            data: {
                code: `INF-ALR-${region.code}-2026-01-${String(alertReports.length + 1).padStart(4, '0')}`,
                type: ReportType.ALERT,
                format: ReportFormat.PDF,
                url: `https://storage.utpcontrol.com/reports/alerts/${region.code.toLowerCase()}-alerta-critica.pdf`,
                hashSha256: crypto.createHash('sha256')
                    .update(`alert-${region.code}-critica`)
                    .digest('hex'),
                generatedById: coordinator.id,
                regionId: region.id,
                municipalityId: municipality?.id || null,
                metadata: {
                    visibility: 'PUBLIC',
                    priority: 'HIGH',
                    category: 'SEGURIDAD',
                    summary: `Alerta de seguridad - ${region.name}`,
                    description: 'Situación de orden público requiere atención inmediata',
                    actions_required: [
                        'Suspender visitas en zona afectada',
                        'Coordinar con autoridades locales',
                        'Evaluar reasignación de recursos'
                    ],
                    status: 'ACTIVE'
                }
            }
        });

        alertReports.push(alertReport);
        console.log(`  ✅ ${alertReport.code} - Alerta Crítica ${region.name}`);
    }

    console.log(`\n✅ ${alertReports.length} informes de alertas creados\n`);

    // ============================================================================
    // PASO 6: CREAR INFORMES PRIVADOS (Para testing de filtrado)
    // ============================================================================

    console.log('🔐 Creando informes privados (testing)...\n');

    const privateReports: Report[] = [];

    if (regions.length > 0) {
        const region = regions[0];

        const privateReport = await prisma.report.create({
            data: {
                code: `INF-REG-${region.code}-PRIV-2026-01-${String(privateReports.length + 1).padStart(4, '0')}`,
                type: ReportType.REGIONAL,
                format: ReportFormat.PDF,
                url: `https://storage.utpcontrol.com/reports/regional/${region.code.toLowerCase()}-privado.pdf`,
                hashSha256: crypto.createHash('sha256')
                    .update(`regional-${region.code}-privado`)
                    .digest('hex'),
                generatedById: admin.id,
                regionId: region.id,
                municipalityId: null,
                metadata: {
                    visibility: 'RESTRICTED',
                    period: 'ENERO 2026',
                    category: 'ESTRATÉGICO',
                    summary: 'Informe estratégico confidencial - Solo ADMIN y COORDINATOR',
                    classification: 'CONFIDENCIAL',
                    access_level: 'RESTRICTED'
                }
            }
        });

        privateReports.push(privateReport);
        console.log(`  ✅ ${privateReport.code} - Informe Privado ${region.name}`);
    }

    console.log(`\n✅ ${privateReports.length} informes privados creados\n`);

    // ============================================================================
    // RESUMEN
    // ============================================================================

    const totalReports = regionalReports.length + auditReports.length +
        generalReports.length + alertReports.length +
        privateReports.length;

    console.log('========================================');
    console.log('✅ POBLACIÓN COMPLETADA');
    console.log('========================================');
    console.log(`📊 Informes Regionales: ${regionalReports.length}`);
    console.log(`🔒 Informes de Auditoría: ${auditReports.length}`);
    console.log(`📈 Informes Generales: ${generalReports.length}`);
    console.log(`⚠️  Informes de Alertas: ${alertReports.length}`);
    console.log(`🔐 Informes Privados: ${privateReports.length}`);
    console.log(`📁 TOTAL: ${totalReports} informes`);
    console.log('========================================\n');

    // ============================================================================
    // VERIFICACIÓN
    // ============================================================================

    console.log('🔍 Verificando población...\n');

    const countByType = await prisma.report.groupBy({
        by: ['type'],
        _count: true
    });

    console.log('Informes por tipo:');
    countByType.forEach(item => {
        console.log(`  ${item.type}: ${item._count}`);
    });

    console.log('\n✅ Verificación completada\n');
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
