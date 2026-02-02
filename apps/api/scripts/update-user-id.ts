import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUserId() {
    try {
        const targetId = '1382c86a-1063-4c28-b131-35460c0b9c83';
        const email = 'antonio_rburgos@msn.com';

        // Buscar el usuario con ese email
        const existingUser = await prisma.user.findFirst({
            where: { email: email }
        });

        if (!existingUser) {
            console.log('❌ Usuario no encontrado');
            return;
        }

        console.log(`📋 Usuario encontrado:`);
        console.log(`   ID actual: ${existingUser.id}`);
        console.log(`   ID requerido: ${targetId}`);
        console.log(`   Email: ${existingUser.email}`);
        console.log(`   Nombre: ${existingUser.fullName}`);

        if (existingUser.id === targetId) {
            console.log('\n✅ El ID ya es correcto');

            // Solo asegurar que esté activo
            if (!existingUser.isActive) {
                await prisma.user.update({
                    where: { id: targetId },
                    data: { isActive: true }
                });
                console.log('✅ Usuario activado');
            }
            return;
        }

        // Actualizar el ID usando SQL directo
        console.log('\n🔄 Actualizando ID del usuario...');

        await prisma.$executeRawUnsafe(`
      UPDATE public.users 
      SET id = '${targetId}'
      WHERE email = '${email}'
    `);

        console.log('✅ ID actualizado exitosamente');

        // Verificar
        const updated = await prisma.user.findUnique({
            where: { id: targetId }
        });

        if (updated) {
            console.log('\n✅ Verificación exitosa:');
            console.log(`   ID: ${updated.id}`);
            console.log(`   Email: ${updated.email}`);
            console.log(`   Nombre: ${updated.fullName}`);
            console.log(`   Activo: ${updated.isActive}`);
        }

        console.log('\n💡 Recarga la página del dashboard');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateUserId();
