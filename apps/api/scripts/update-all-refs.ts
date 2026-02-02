import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateAllReferences() {
    try {
        const oldId = '69394a49-bdd1-4b4a-a163-1cd8ef72ee64';
        const newId = '1382c86a-1063-4c28-b131-35460c0b9c83';

        console.log('🔄 Actualizando referencias de usuario...');
        console.log(`   ID antiguo: ${oldId}`);
        console.log(`   ID nuevo: ${newId}\n`);

        // Actualizar todas las tablas en una transacción
        await prisma.$transaction(async (tx) => {
            // 1. audit_logs
            console.log('1️⃣ Actualizando audit_logs...');
            await tx.$executeRawUnsafe(`UPDATE public.audit_logs SET "userId" = '${newId}' WHERE "userId" = '${oldId}'`);

            // 2. reports
            console.log('2️⃣ Actualizando reports...');
            await tx.$executeRawUnsafe(`UPDATE public.reports SET "generatedById" = '${newId}' WHERE "generatedById" = '${oldId}'`);

            // 3. regional_reports
            console.log('3️⃣ Actualizando regional_reports...');
            await tx.$executeRawUnsafe(`UPDATE public.regional_reports SET "createdById" = '${newId}' WHERE "createdById" = '${oldId}'`);

            // 4. documents
            console.log('4️⃣ Actualizando documents...');
            await tx.$executeRawUnsafe(`UPDATE public.documents SET "uploadedById" = '${newId}' WHERE "uploadedById" = '${oldId}'`);

            // 5. visits
            console.log('5️⃣ Actualizando visits...');
            await tx.$executeRawUnsafe(`UPDATE public.visits SET "gestorId" = '${newId}' WHERE "gestorId" = '${oldId}'`);

            // 6. push_subscriptions
            console.log('6️⃣ Actualizando push_subscriptions...');
            await tx.$executeRawUnsafe(`UPDATE public.push_subscriptions SET "userId" = '${newId}' WHERE "userId" = '${oldId}'`);

            // 7. users
            console.log('7️⃣ Actualizando users...');
            await tx.$executeRawUnsafe(`UPDATE public.users SET id = '${newId}' WHERE id = '${oldId}'`);
        });

        console.log('\n✅ Todas las referencias actualizadas exitosamente');

        // Verificar
        const user = await prisma.user.findUnique({
            where: { id: newId }
        });

        if (user) {
            console.log('\n✅ Usuario verificado:');
            console.log(`   ID: ${user.id}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Nombre: ${user.fullName}`);
            console.log(`   Activo: ${user.isActive}`);
        }

        console.log('\n💡 Recarga la página del dashboard');

    } catch (error: any) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

updateAllReferences();
