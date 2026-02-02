import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyMigration() {
    const newId = '1382c86a-1063-4c28-b131-35460c0b9c83';
    const oldId = '69394a49-bdd1-4b4a-a163-1cd8ef72ee64';

    console.log('🔍 Verificando estado post-migración...\n');

    // 1. Verificar Usuario Nuevo
    const newUser = await prisma.user.findUnique({
        where: { id: newId },
        include: {
            _count: {
                select: { reports: true, auditLogs: true } // Corregido: reports, no generatedReports
            }
        }
    });

    if (newUser) {
        console.log('✅ Usuario Supabase (Nuevo) ENCONTRADO:');
        console.log(`   ID: ${newUser.id}`);
        console.log(`   Email: ${newUser.email}`);
        console.log(`   Rol: ${newUser.role}`);
        console.log(`   Activo: ${newUser.isActive}`);
        console.log(`   Reportes: ${newUser._count.reports}`);
        console.log(`   Logs: ${newUser._count.auditLogs}`);
    } else {
        console.log('❌ Usuario Supabase (Nuevo) NO ENCONTRADO en public.users');
    }

    console.log('\n-------------------\n');

    // 2. Verificar Usuario Viejo
    const oldUser = await prisma.user.findUnique({
        where: { id: oldId }
    });

    if (oldUser) {
        console.log('⚠️  Usuario Viejo AÚN EXISTE (Debería haber sido eliminado):');
        console.log(`   ID: ${oldUser.id}`);
        console.log(`   Email: ${oldUser.email}`);
    } else {
        console.log('✅ Usuario Viejo ELIMINADO correctamente');
    }
}

verifyMigration()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
