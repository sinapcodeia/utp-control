const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- VERIFYING USERS ---');

        const publicUsers = await prisma.$queryRaw`SELECT id, email, role, dni FROM public.users WHERE email IN ('admin@test.com', 'gestor@test.com', 'coord@test.com')`;
        console.log('Public Users:', JSON.stringify(publicUsers, null, 2));

        const authUsers = await prisma.$queryRaw`SELECT id, email, raw_user_meta_data FROM auth.users WHERE email IN ('admin@test.com', 'gestor@test.com', 'coord@test.com')`;
        console.log('Auth Users:', JSON.stringify(authUsers, null, 2));

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}
main();
