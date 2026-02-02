import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixDuplicateEmail() {
    try {
        const targetId = '1382c86a-1063-4c28-b131-35460c0b9c83';
        const email = 'antonio_rburgos@msn.com';

        // Buscar todos los usuarios con ese email
        const users = await prisma.user.findMany({
            where: { email: email }
        });

        console.log(`📋 Usuarios con email ${email}: ${users.length}`);
        users.forEach(u => {
            console.log(`   - ID: ${u.id}`);
            console.log(`     Nombre: ${u.fullName}`);
            console.log(`     Activo: ${u.isActive}`);
            console.log('');
        });

        // Eliminar usuarios con IDs diferentes al target
        for (const user of users) {
            if (user.id !== targetId) {
                console.log(`🗑️  Eliminando usuario duplicado: ${user.id}`);
                await prisma.user.delete({
                    where: { id: user.id }
                });
                console.log('✅ Eliminado');
            }
        }

        // Verificar si el usuario target existe
        const targetUser = await prisma.user.findUnique({
            where: { id: targetId }
        });

        if (targetUser) {
            console.log('\n✅ Usuario correcto ya existe');
            console.log(`   ID: ${targetUser.id}`);
            console.log(`   Email: ${targetUser.email}`);
            console.log(`   Activo: ${targetUser.isActive}`);

            // Asegurar que esté activo
            if (!targetUser.isActive) {
                await prisma.user.update({
                    where: { id: targetId },
                    data: { isActive: true }
                });
                console.log('✅ Usuario activado');
            }
        } else {
            // Crear el usuario correcto
            console.log('\n📝 Creando usuario correcto...');
            const newUser = await prisma.user.create({
                data: {
                    id: targetId,
                    email: email,
                    fullName: 'Antonio Burgos',
                    role: 'ADMIN',
                    isActive: true,
                    acceptedTerms: true,
                    acceptedAt: new Date(),
                    passwordHash: 'supabase_managed',
                    dni: '00000000'
                }
            });
            console.log('✅ Usuario creado');
            console.log(`   ID: ${newUser.id}`);
        }

        console.log('\n💡 Recarga la página del dashboard');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixDuplicateEmail();
