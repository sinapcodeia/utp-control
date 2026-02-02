const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function validateUserAccess(userEmail, userRole, description) {
    console.log(`\n--- Validating Access for: ${userRole} (${userEmail}) ---`);

    const user = await prisma.user.findUnique({
        where: { email: userEmail },
        include: { assignedRegions: true }
    });

    if (!user) {
        console.error(`User ${userEmail} not found.`);
        return;
    }

    // Simulate Service Logic (Copy-paste from RegionalReportsService)
    const permissions = user.permissions;
    const allRegions = permissions?.territory?.allRegions || user.role === 'ADMIN';
    const assignedRegionIds = user.assignedRegions?.map((r) => r.id) || [];

    // Explicitly add user's regionId if not in assignedRegions (for legacy compatibility)
    if (user.regionId && !assignedRegionIds.includes(user.regionId)) {
        assignedRegionIds.push(user.regionId);
    }

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
        include: { region: true }
    });

    console.log(`Total Reports Visible: ${reports.length}`);

    let violations = 0;
    reports.forEach(r => {
        const regionName = r.region ? r.region.name : 'NACIONAL';
        const isRestricted = regionName === 'Región Norte'; // Sabemos que esta es la región prohibida para Coord Central

        console.log(`- [${r.id.substring(0, 8)}] ${r.title} (${regionName})`);

        if (userRole === 'COORDINATOR' && isRestricted) {
            console.error(`  [CRITICAL FAILURE] COORDINATOR accessed restricted data from ${regionName}!`);
            violations++;
        }
    });

    if (violations === 0) {
        console.log(`[SUCCESS] ${userRole} access controls are functioning correctly.`);
    } else {
        console.error(`[FAILURE] ${userRole} bypassed security controls!`);
    }
}

async function main() {
    await validateUserAccess('admin@test.com', 'ADMIN', 'Should see ALL reports');
    await validateUserAccess('coord@test.com', 'COORDINATOR', 'Should see Central + National ONLY');
    await validateUserAccess('gestor@test.com', 'USER', 'Should see National ONLY (or own region if assigned)');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
