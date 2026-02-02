import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listUsers() {
    try {
        // Listar usuarios en public.users
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                isActive: true
            },
            orderBy: { email: 'asc' }
        });

        console.log(`📋 Total de usuarios en public.users: ${users.length}\n`);

        users.forEach((user, i) => {
            console.log(`${i + 1}. ${user.email}`);
            console.log(`   ID: ${user.id}`);
            console.log(`   Nombre: ${user.fullName}`);
            console.log(`   Rol: ${user.role}`);
            console.log(`   Activo: ${user.isActive ? '✅' : '❌'}`);
            console.log('');
        });

        // Verificar el usuario problemático
        const problematicId = '1382c86a-1063-4c28-b131-35460c0b9c83';
        const problematicUser = users.find(u => u.id === problematicId);

        if (problematicUser) {
            console.log(`✅ Usuario ${problematicId} encontrado:`);
            console.log(`   Email: ${problematicUser.email}`);
            console.log(`   Activo: ${problematicUser.isActive}`);
        } else {
            console.log(`❌ Usuario ${problematicId} NO encontrado en public.users`);

            // Buscar en auth.users
            const authUser = await prisma.$queryRawUnsafe<any[]>(`
        SELECT id, email 
        FROM auth.users 
        WHERE id = '${problematicId}'
      `);

            if (authUser.length > 0) {
                console.log(`\n⚠️  Usuario existe en auth.users pero no en public.users:`);
                console.log(`   Email: ${authUser[0].email}`);
            }
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

listUsers();
