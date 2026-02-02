const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const regions = await prisma.region.count();
    const municipalities = await prisma.municipality.count();
    const veredas = await prisma.vereda.count();

    console.log('--- RESUMEN DE DATOS GEOGRÁFICOS ---');
    console.log(`Departamentos: ${regions}`);
    console.log(`Municipios:    ${municipalities}`);
    console.log(`Veredas:       ${veredas}`);
    console.log('------------------------------------');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
