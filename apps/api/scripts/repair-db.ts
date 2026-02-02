
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Iniciando reparación de tabla users...");
    try {
        await prisma.$executeRawUnsafe(`ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT;`).catch(e => console.log("full_name skip"));
        await prisma.$executeRawUnsafe(`ALTER TABLE users ADD COLUMN IF NOT EXISTS dni TEXT;`).catch(e => console.log("dni skip"));
        await prisma.$executeRawUnsafe(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;`).catch(e => console.log("is_active skip"));
        await prisma.$executeRawUnsafe(`ALTER TABLE users ADD COLUMN IF NOT EXISTS accepted_terms BOOLEAN DEFAULT FALSE;`).catch(e => console.log("accepted_terms skip"));
        await prisma.$executeRawUnsafe(`ALTER TABLE users ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP WITH TIME ZONE;`).catch(e => console.log("accepted_at skip"));

        try {
            await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS users_dni_key ON users(dni);`);
        } catch (e) { }

        console.log("Reparación completada.");
    } catch (e: any) {
        console.error("Error crítico:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
