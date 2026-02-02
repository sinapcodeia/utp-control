import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUserIdManual() {
    const oldId = '69394a49-bdd1-4b4a-a163-1cd8ef72ee64'; // Usuario en BD (Antonio Burgos)
    const newId = '1382c86a-1063-4c28-b131-35460c0b9c83'; // Usuario Autenticado en Supabase

    console.log('🔄 Iniciando migración manual de ID de usuario...');
    console.log(`   ID Actual (BD):     ${oldId}`);
    console.log(`   ID Nuevo (Auth):    ${newId}`);

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Audit Logs (user_id)
            console.log('1️⃣ Actualizando audit_logs...');
            const audit = await tx.$executeRawUnsafe(`UPDATE public.audit_logs SET user_id = '${newId}' WHERE user_id = '${oldId}'`);
            console.log(`   -> ${audit} registros`);

            // 2. Reports (generated_by, authorized_by)
            console.log('2️⃣ Actualizando reports...');
            const repGen = await tx.$executeRawUnsafe(`UPDATE public.reports SET generated_by = '${newId}' WHERE generated_by = '${oldId}'`);
            console.log(`   -> ${repGen} generados`);
            const repAuth = await tx.$executeRawUnsafe(`UPDATE public.reports SET authorized_by = '${newId}' WHERE authorized_by = '${oldId}'`);
            console.log(`   -> ${repAuth} autorizados`);

            // 3. Regional Reports (user_id)
            console.log('3️⃣ Actualizando regional_reports...');
            const regRep = await tx.$executeRawUnsafe(`UPDATE public.regional_reports SET user_id = '${newId}' WHERE user_id = '${oldId}'`);
            console.log(`   -> ${regRep} registros`);

            // 4. Documents (uploader_id)
            console.log('4️⃣ Actualizando documents...');
            const docs = await tx.$executeRawUnsafe(`UPDATE public.documents SET uploader_id = '${newId}' WHERE uploader_id = '${oldId}'`);
            console.log(`   -> ${docs} registros`);

            // 5. Document Comments (user_id)
            console.log('5️⃣ Actualizando document_comments...');
            const comments = await tx.$executeRawUnsafe(`UPDATE public.document_comments SET user_id = '${newId}' WHERE user_id = '${oldId}'`);
            console.log(`   -> ${comments} registros`);

            // 6. Push Subscriptions (user_id)
            console.log('6️⃣ Actualizando push_subscriptions...');
            const push = await tx.$executeRawUnsafe(`UPDATE public.push_subscriptions SET user_id = '${newId}' WHERE user_id = '${oldId}'`);
            console.log(`   -> ${push} registros`);

            // 7. News Read Receipts (user_id)
            console.log('7️⃣ Actualizando news_read_receipts...');
            const receipts = await tx.$executeRawUnsafe(`UPDATE public.news_read_receipts SET user_id = '${newId}' WHERE user_id = '${oldId}'`);
            console.log(`   -> ${receipts} registros`);

            // 8. Visits (assigned_to, assigned_by)
            console.log('8️⃣ Actualizando visits...');
            const visitAssigned = await tx.$executeRawUnsafe(`UPDATE public.visits SET assigned_to = '${newId}' WHERE assigned_to = '${oldId}'`);
            console.log(`   -> ${visitAssigned} asignadas`);
            const visitAssigner = await tx.$executeRawUnsafe(`UPDATE public.visits SET assigned_by = '${newId}' WHERE assigned_by = '${oldId}'`);
            console.log(`   -> ${visitAssigner} asignador por`);

            // 9. Visit Logs (user_id)
            console.log('9️⃣ Actualizando visit_logs...');
            const visitLogs = await tx.$executeRawUnsafe(`UPDATE public.visit_logs SET user_id = '${newId}' WHERE user_id = '${oldId}'`);
            console.log(`   -> ${visitLogs} registros`);

            // 10. Finalmente, Users (id)
            console.log('🔟 Actualizando users...');
            // Primero verificamos si el ID nuevo ya existe (quizás creado por un intento anterior)
            const existingNew = await tx.$queryRawUnsafe<any[]>(`SELECT id FROM public.users WHERE id = '${newId}'`);

            if (existingNew.length > 0) {
                console.log('   ⚠️ El ID nuevo ya existe en users. Eliminando para permitir actualización...');
                await tx.$executeRawUnsafe(`DELETE FROM public.users WHERE id = '${newId}'`);
            }

            const users = await tx.$executeRawUnsafe(`UPDATE public.users SET id = '${newId}' WHERE id = '${oldId}'`);
            console.log(`   -> ${users} usuario actualizado`);

        });

        console.log('\n✅ ¡MIGRACIÓN COMPLETADA EXITOSAMENTE!');
        console.log('💡 Recarga el dashboard. Tus reportes deberían aparecer ahora.');

    } catch (error) {
        console.error('\n❌ ERROR CRÍTICO:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateUserIdManual();
