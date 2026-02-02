import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkReports() {
    try {
        const count = await prisma.report.count();
        console.log(`📊 Total de reportes en la BD: ${count}`);

        if (count > 0) {
            const reports = await prisma.report.findMany({
                take: 5,
                orderBy: { generatedAt: 'desc' },
                include: {
                    generatedBy: {
                        select: {
                            fullName: true,
                            role: true
                        }
                    }
                }
            });

            console.log('\n📋 Últimos 5 reportes:');
            reports.forEach((r, i) => {
                console.log(`\n${i + 1}. ${r.code}`);
                console.log(`   Tipo: ${r.type}`);
                console.log(`   Generado por: ${r.generatedBy?.fullName || 'N/A'}`);
                console.log(`   Fecha: ${r.generatedAt.toISOString()}`);
            });
        } else {
            console.log('\n⚠️  No hay reportes en la base de datos');
            console.log('💡 Necesitas generar al menos un reporte primero');
        }
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkReports();
