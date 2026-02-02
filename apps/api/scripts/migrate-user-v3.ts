import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateUserV3() {
    const oldId = '69394a49-bdd1-4b4a-a163-1cd8ef72ee64'; // Usuario en BD (Antonio Burgos)
    const newId = '1382c86a-1063-4c28-b131-35460c0b9c83'; // Usuario Autenticado en Supabase
    const targetEmail = 'antonio_rburgos@msn.com';

    console.log('🔄 Iniciando migración V3 (Secuencial)...');

    try {
        // PASO 1: Verificar y Renombrar Antiguo
        console.log('1️⃣  Verificando usuario antiguo...');
        const oldUser = await prisma.user.findUnique({ where: { id: oldId } });

        if (oldUser) {
            console.log('   Usuario antiguo encontrado. Renombrando constraints...');
            const timestamp = Date.now();
            // Solo renombrar si tiene el email o dni conflictivo
            const needsRename = oldUser.email === targetEmail || oldUser.dni === oldUser.dni; // DNI check simple
            if (needsRename) {
                await prisma.user.update({
                    where: { id: oldId },
                    data: {
                        email: `temp_${timestamp}_${targetEmail}`,
                        dni: `temp_${timestamp}_${oldUser.dni || 'no_dni'}`
                    }
                });
                console.log('   ✅ Constraints liberados');
            }
        } else {
            console.log('   ⚠️ Usuario antiguo no encontrado. Asumiendo que ya fue eliminado o renombrado.');
        }

        // PASO 2: Crear Nuevo Usuario
        console.log('2️⃣  Verificando/Creando nuevo usuario...');
        let newUser = await prisma.user.findUnique({ where: { id: newId } });

        if (!newUser) {
            if (!oldUser) throw new Error('No se puede crear nuevo usuario: no hay datos origen');

            console.log('   Creando nuevo usuario...');
            newUser = await prisma.user.create({
                data: {
                    id: newId,
                    email: targetEmail,
                    dni: oldUser.dni?.startsWith('temp_') ? oldUser.dni.split('_').pop() : (oldUser.dni || '00000000'), // Intentar recuperar DNI original
                    passwordHash: oldUser.passwordHash || 'supabase_managed',
                    fullName: oldUser.fullName,
                    phone: oldUser.phone,
                    role: 'ADMIN',
                    isActive: true,
                    permissions: oldUser.permissions || {},
                    acceptedTerms: oldUser.acceptedTerms,
                    acceptedAt: oldUser.acceptedAt,
                    regionId: oldUser.regionId,
                    municipalityId: oldUser.municipalityId,
                }
            });
            console.log('   ✅ Nuevo usuario creado');
        } else {
            console.log('   Usuarios ya existe. Validando...');
            if (newUser.email !== targetEmail) {
                await prisma.user.update({ where: { id: newId }, data: { email: targetEmail, role: 'ADMIN' } });
                console.log('   ✅ Datos actualizados');
            }
        }

        // PASO 3: Mover Registros (Uno por uno para evitar timeouts)
        console.log('3️⃣  Moviendo registros...');

        // Lista de operaciones
        const ops = [
            { table: 'audit_logs', col: 'user_id' },
            { table: 'reports', col: 'generated_by' },
            { table: 'reports', col: 'authorized_by' },
            { table: 'regional_reports', col: 'user_id' },
            { table: 'documents', col: 'uploader_id' },
            { table: 'document_comments', col: 'user_id' },
            { table: 'visit_logs', col: 'user_id' },
        ];

        for (const op of ops) {
            const res = await prisma.$executeRawUnsafe(`UPDATE public.${op.table} SET ${op.col} = '${newId}' WHERE ${op.col} = '${oldId}'`);
            console.log(`   -> ${op.table}: ${res} movidos`);
        }

        // Casos especiales
        console.log('   -> visits (assigned_to)');
        await prisma.$executeRawUnsafe(`UPDATE public.visits SET assigned_to = '${newId}' WHERE assigned_to = '${oldId}'`);
        console.log('   -> visits (assigned_by)');
        await prisma.$executeRawUnsafe(`UPDATE public.visits SET assigned_by = '${newId}' WHERE assigned_by = '${oldId}'`);

        console.log('   -> push_subscriptions');
        await prisma.$executeRawUnsafe(`DELETE FROM public.push_subscriptions WHERE user_id = '${newId}'`);
        await prisma.$executeRawUnsafe(`UPDATE public.push_subscriptions SET user_id = '${newId}' WHERE user_id = '${oldId}'`);

        console.log('   -> news_read_receipts');
        await prisma.$executeRawUnsafe(`
        DELETE FROM public.news_read_receipts 
        WHERE user_id = '${oldId}' 
        AND report_id IN (SELECT report_id FROM public.news_read_receipts WHERE user_id = '${newId}')
    `);
        await prisma.$executeRawUnsafe(`UPDATE public.news_read_receipts SET user_id = '${newId}' WHERE user_id = '${oldId}'`);

        // PASO 4: Eliminar Viejo
        console.log('4️⃣  Limpiando usuario antiguo...');
        if (oldUser) {
            // Verificar que no queden referencias (opcional, pero buena práctica)
            const check = await prisma.report.count({ where: { generatedById: oldId } });
            if (check === 0) {
                await prisma.user.delete({ where: { id: oldId } });
                console.log('   ✅ Usuario antiguo eliminado');
            } else {
                console.log(`   ⚠️ Aún quedan ${check} reportes generados por el usuario antiguo. No se eliminó.`);
            }
        }

        console.log('\n✅ ¡MIGRACIÓN COMPLETADA!');

    } catch (error: any) {
        console.error('\n❌ ERROR:', error);
    } finally {
        await prisma.$disconnect();
    }
}

migrateUserV3();
