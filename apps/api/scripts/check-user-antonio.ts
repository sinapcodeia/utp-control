import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
    try {
        const user = await prisma.user.findUnique({
            where: { email: 'antonio_rburgos@msn.com' },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                isActive: true,
                regionId: true,
                region: {
                    select: {
                        name: true
                    }
                }
            }
        });

        if (!user) {
            console.log('❌ Usuario NO encontrado en la base de datos');
        } else {
            console.log('✅ Usuario encontrado:');
            console.log(JSON.stringify(user, null, 2));
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUser();
