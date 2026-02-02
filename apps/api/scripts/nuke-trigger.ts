
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔥 Nuke Triggers Script...');

    try {
        console.log('Dropping on_auth_user_created...');
        await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;`);

        // Also drop the function just to be sure nothing references it
        console.log('Dropping handle_new_user function...');
        await prisma.$executeRawUnsafe(`DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;`);

        console.log('✅ Trigger and Function Dropped. Login should be clean.');

    } catch (error) {
        console.error('❌ Error dropping:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
