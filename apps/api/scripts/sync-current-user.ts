import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function syncUser() {
    try {
        const userId = '1382c86a-1063-4c28-b131-35460c0b9c83';

        // Verificar si el usuario existe en auth.users
        const authUser = await prisma.$queryRawUnsafe<any[]>(`
      SELECT id, email, created_at 
      FROM auth.users 
      WHERE id = '${userId}'
    `);

        if (authUser.length === 0) {
            console.log('❌ Usuario no encontrado en auth.users');
            return;
        }

        console.log('✅ Usuario encontrado en auth.users:');
        console.log(`   Email: ${authUser[0].email}`);
        console.log(`   ID: ${authUser[0].id}`);

        // Verificar si ya existe en public.users
        const publicUser = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (publicUser) {
            console.log('\n✅ Usuario ya existe en public.users');
            console.log(`   Nombre: ${publicUser.fullName}`);
            console.log(`   Rol: ${publicUser.role}`);
            console.log(`   Activo: ${publicUser.isActive}`);
            return;
        }

        // Crear usuario en public.users
        console.log('\n📝 Creando usuario en public.users...');

        const newUser = await prisma.user.create({
            data: {
                id: userId,
                email: authUser[0].email,
                fullName: authUser[0].email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
                role: 'ADMIN', // Asignar rol ADMIN por defecto
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

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

syncUser();
