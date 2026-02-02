
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const emails = ['admin@test.com', 'coord@test.com', 'gestor@test.com'];
    console.log('🔍 Checking Public Users Sync...');

    const users = await prisma.user.findMany({
        where: { email: { in: emails } },
        select: { email: true, role: true, id: true }
    });

    console.log('Resultados:');
    emails.forEach(email => {
        const found = users.find(u => u.email === email);
        if (found) {
            console.log(`✅ ${email}: ${found.role} (ID: ${found.id})`);
        } else {
            console.log(`❌ ${email}: MISSING in public.users`);
        }
    });

    // Count overall
    const count = await prisma.user.count();
    console.log(`Total Public Users: ${count}`);
}

main().finally(() => prisma.$disconnect());
