import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateUserFinal() {
    const oldId = '69394a49-bdd1-4b4a-a163-1cd8ef72ee64'; // Usuario en BD (Antonio Burgos)
    const newId = '1382c86a-1063-4c28-b131-35460c0b9c83'; // Usuario Autenticado en Supabase
    const targetEmail = 'antonio_rburgos@msn.com';

    console.log('🔄 Iniciando migración FINAL (Renombrar -> Clonar -> Reasignar -> Eliminar)...');

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Obtener usuario viejo
            const existingUser = await tx.user.findUnique({ where: { id: oldId } });
            if (!existingUser) throw new Error('Usuario original no encontrado');

            // 2. Renombrar email del viejo para liberar el UNIQUE constraint
            console.log('1️⃣  Liberando email del usuario antiguo...');
            await tx.user.update({
                where: { id: oldId },
                data: { email: `temp_${Date.now()}_${targetEmail}` }
            });

            // 3. Crear el nuevo usuario
            const existingNew = await tx.user.findUnique({ where: { id: newId } });

            if (!existingNew) {
                console.log('2️⃣  Creando usuario destino...');
                await tx.user.create({
                    data: {
                        id: newId,
                        email: targetEmail, // Email correcto
                        passwordHash: existingUser.passwordHash || 'supabase_managed',
                        fullName: existingUser.fullName,
                        dni: existingUser.dni,
                        phone: existingUser.phone,
                        role: existingUser.role,
                        isActive: existingUser.isActive,
                        permissions: existingUser.permissions || {},
                        acceptedTerms: existingUser.acceptedTerms,
                        acceptedAt: existingUser.acceptedAt,
                        regionId: existingUser.regionId,
                        municipalityId: existingUser.municipalityId,
                    }
                });
            } else {
                console.log('2️⃣  Usuario destino ya existe. Actualizando rol/email...');
                await tx.user.update({
                    where: { id: newId },
                    data: {
                        role: 'ADMIN',
                        email: targetEmail // Asegurar email
                    }
                });
            }

            // 4. Reasignar registros (SQL Manual)
            console.log('3️⃣  Reasignando registros hijos...');

            const tables = [
                { table: 'audit_logs', col: 'user_id' },
                { table: 'reports', col: 'generated_by' },
                { table: 'reports', col: 'authorized_by' },
                { table: 'regional_reports', col: 'user_id' },
                { table: 'documents', col: 'uploader_id' },
                { table: 'document_comments', col: 'user_id' },
                { table: 'visit_logs', col: 'user_id' }
            ];

            for (const t of tables) {
                const count = await tx.$executeRawUnsafe(`UPDATE public.${t.table} SET ${t.col} = '${newId}' WHERE ${t.col} = '${oldId}'`);
                console.log(`    -> ${t.table} (${t.col}): ${count}`);
            }

            // Casos especiales (Visits, Push, ReadReceipts)
            await tx.$executeRawUnsafe(`DELETE FROM public.push_subscriptions WHERE user_id = '${newId}'`);
            await tx.$executeRawUnsafe(`UPDATE public.push_subscriptions SET user_id = '${newId}' WHERE user_id = '${oldId}'`);

            await tx.$executeRawUnsafe(`UPDATE public.news_read_receipts SET user_id = '${newId}' WHERE user_id = '${oldId}' ON CONFLICT DO NOTHING`);
            await tx.$executeRawUnsafe(`DELETE FROM public.news_read_receipts WHERE user_id = '${oldId}'`);

            await tx.$executeRawUnsafe(`UPDATE public.visits SET assigned_to = '${newId}' WHERE assigned_to = '${oldId}'`);
            await tx.$executeRawUnsafe(`UPDATE public.visits SET assigned_by = '${newId}' WHERE assigned_by = '${oldId}'`);

            // 5. Eliminar usuario viejo
            console.log('4️⃣  Eliminando usuario temporal...');
            await tx.user.delete({ where: { id: oldId } });

        });

        console.log('\n✅ ¡MIGRACIÓN COMPLETADA!');

    } catch (error: any) {
        console.error('\n❌ ERROR:', error);
    } finally {
        await prisma.$disconnect();
    }
}

migrateUserFinal();
