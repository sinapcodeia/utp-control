import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function activateUser() {
    try {
        const userId = '1382c86a-1063-4c28-b131-35460c0b9c83';
        const email = 'antonio_rburgos@msn.com';

        // Verificar si ya existe
        const existing = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (existing) {
            console.log('✅ Usuario ya existe en public.users');
            console.log(`   Actualizando estado...`);

            const updated = await prisma.user.update({
                where: { id: userId },
                data: {
                    isActive: true,
                    acceptedTerms: true,
                    acceptedAt: new Date()
                }
            });

            console.log('✅ Usuario actualizado');
            return;
        }

        // Crear usuario
        console.log('📝 Creando usuario en public.users...');

        const newUser = await prisma.user.create({
            data: {
                id: userId,
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

        console.log('✅ Usuario creado exitosamente:');
        console.log(`   ID: ${newUser.id}`);
        console.log(`   Email: ${newUser.email}`);
        console.log(`   Nombre: ${newUser.fullName}`);
        console.log(`   Rol: ${newUser.role}`);
        console.log(`   Activo: ${newUser.isActive}`);

        // Crear log de auditoría
        await prisma.auditLog.create({
            data: {
                userId: newUser.id,
                action: 'USER_SYNC',
                entity: 'User',
                entityId: newUser.id,
                metadata: { source: 'auth.users', automated: true }
            }
        });

        console.log('\n💡 Ahora recarga la página del dashboard');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

activateUser();
