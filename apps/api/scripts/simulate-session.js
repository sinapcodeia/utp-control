const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function simulateUserSession(email, role) {
    console.log(`\n==================================================`);
    console.log(`INICIANDO SESIÓN DE USUARIO: ${email} (${role})`);
    console.log(`==================================================`);
    console.log(`[${new Date().toISOString()}] Usuario ingresa credenciales...`);

    const user = await prisma.user.findUnique({
        where: { email },
        include: { assignedRegions: true, region: true }
    });

    if (!user) {
        console.log(`[ERROR] Usuario no encontrado en base de datos.`);
        return;
    }

    console.log(`[${new Date().toISOString()}] Autenticación exitosa.`);
    console.log(`[INFO] Perfil cargado: ID=${user.id}, Rol=${user.role}`);
    console.log(`[INFO] Región Base: ${user.region ? user.region.name : 'Ninguna'}`);
    console.log(`[INFO] Regiones Asignadas: ${user.assignedRegions.map(r => r.name).join(', ') || 'Ninguna'}`);

    console.log(`\n[ACCIÓN] Usuario navega al Dashboard...`);
    console.log(`[SISTEMA] Calculando permisos de visualización...`);

    // Logic simulation
    const permissions = user.permissions;
    const allRegions = permissions?.territory?.allRegions || user.role === 'ADMIN';
    const assignedRegionIds = user.assignedRegions?.map((r) => r.id) || [];
    if (user.regionId && !assignedRegionIds.includes(user.regionId)) assignedRegionIds.push(user.regionId);

    console.log(`[DEBUG] Permiso 'allRegions': ${allRegions}`);
    console.log(`[DEBUG] IDs de Regiones permitidas: ${assignedRegionIds.length > 0 ? assignedRegionIds : 'Solo Nacional'}`);

    console.log(`\n[ACCIÓN] Usuario solicita lista de Reportes...`);

    const whereClause = {
        AND: [
            allRegions
                ? {}
                : {
                    OR: [
                        { regionId: { in: assignedRegionIds } },
                        { regionId: null }
                    ]
                }
        ]
    };

    const reports = await prisma.regionalReport.findMany({
        where: whereClause,
        include: { region: true },
        orderBy: { priority: 'desc' }
    });

    console.log(`[SISTEMA] Retornando ${reports.length} reportes autorizados.`);

    console.log(`\n--- VISTA DEL USUARIO ---`);
    if (reports.length === 0) {
        console.log("(No hay reportes visibles)");
    }
    reports.forEach(r => {
        const regionName = r.region ? r.region.name : 'NACIONAL';
        console.log(`📄 [${r.priority}] ${r.title} | 📍 ${regionName}`);
    });
    console.log(`-------------------------`);

    console.log(`\n[${new Date().toISOString()}] Sesión finalizada.\n`);
}

async function main() {
    await simulateUserSession('admin@test.com', 'ADMIN');
    await simulateUserSession('coord@test.com', 'COORDINATOR');
    await simulateUserSession('gestor@test.com', 'USER');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
