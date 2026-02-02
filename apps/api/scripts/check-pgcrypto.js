const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Checking for pgcrypto...');
        const extensions = await prisma.$queryRaw`SELECT * FROM pg_extension WHERE extname = 'pgcrypto'`;
        console.log('Extensions:', JSON.stringify(extensions, null, 2));

        // Test encryption if available
        if (extensions.length > 0) {
            const hash = await prisma.$queryRaw`SELECT extensions.crypt('password', extensions.gen_salt('bf')) as hash`;
            console.log('Hash test:', hash);
        }
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}
main();
