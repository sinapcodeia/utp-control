
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join('C:', 'UTP', 'CONTROL', 'backups', `data_${timestamp}`);

    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    console.log(`🚀 Iniciando exportación de datos críticos a ${backupDir}...`);

    const tables = [
        'user',
        'region',
        'municipality',
        'vereda',
        'regionalReport',
        'visit',
        'document',
        'auditLog'
    ];

    for (const table of tables) {
        try {
            console.log(`📦 Exportando tabla: ${table}...`);
            // @ts-ignore
            const data = await prisma[table].findMany();
            fs.writeFileSync(
                path.join(backupDir, `${table}.json`),
                JSON.stringify(data, null, 2)
            );
            console.log(`✅ ${table} exportada con éxito (${data.length} registros).`);
        } catch (error: any) {
            console.error(`❌ Error exportando ${table}:`, error.message);
        }
    }

    console.log(`✨ Backup de datos finalizado en: ${backupDir}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
