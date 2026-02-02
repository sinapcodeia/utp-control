import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkReports() {
    const userId = '1382c86a-1063-4c28-b131-35460c0b9c83';

    console.log(`🔍 Buscando reportes para usuario: ${userId}\n`);

    // 1. Tabla 'reports' (Informes Oficiales / Consolidado)
    const reports = await prisma.report.findMany({
        where: { generatedById: userId },
        orderBy: { generatedAt: 'desc' }
    });

    console.log(`📋 Tabla 'Report' (Total: ${reports.length})`);
    reports.forEach(r => {
        console.log(`   - [${r.type}] ${r.code} | Fecha: ${r.generatedAt} | ID: ${r.id}`);
    });

    console.log('\n-------------------\n');

    // 2. Tabla 'regional_reports' (Novedades / Reportes de Visita de Campo?)
    // A veces "Reporte de Visita" se refiere a 'RegionalReport' o 'Visit'
    const regionalReports = await prisma.regionalReport.findMany({
        where: { userId: userId },
        orderBy: { createdAt: 'desc' }
    });

    console.log(`🌍 Tabla 'RegionalReport' (Total: ${regionalReports.length})`);
    regionalReports.forEach(r => {
        console.log(`   - [${r.category}] ${r.title} | Priority: ${r.priority} | ID: ${r.id}`);
    });

    console.log('\n-------------------\n');

    // 3. Tabla 'visits' (Visitas en sí mismas)
    const visits = await prisma.visit.findMany({
        where: {
            OR: [
                { assignedToId: userId },
                { assignedById: userId }
            ]
        },
        orderBy: { createdAt: 'desc' }
    });

    console.log(`📍 Tabla 'Visit' (Total: ${visits.length})`);
    visits.forEach(v => {
        console.log(`   - ${v.status} | ${v.addressText} | ID: ${v.id}`);
    });
}

checkReports()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
