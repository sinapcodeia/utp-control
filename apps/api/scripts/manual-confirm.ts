
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const targetEmail = 'docenciainformatica2025@gmail.com';
    console.log(`🚑 Emergency Assist: Unblocking ${targetEmail}...`);

    try {
        // 1. Confirm Email in auth.users
        console.log('1. Confirming email in auth.users...');
        const result = await prisma.$executeRawUnsafe(`
      UPDATE auth.users 
      SET email_confirmed_at = now(),
          last_sign_in_at = now(),
          raw_app_meta_data = raw_app_meta_data || '{"provider":"email","providers":["email"]}'::jsonb
      WHERE email = '${targetEmail}';
    `); // Note: SQL injection risk minimal here as input is hardcoded safely.

        // 2. Get User ID
        const user = await prisma.$queryRawUnsafe<any[]>(`SELECT id FROM auth.users WHERE email = '${targetEmail}'`);

        if (user.length === 0) {
            console.error('❌ User not found in Auth system. Did they actually register?');
            return;
        }

        const userId = user[0].id;
        console.log(`✅ Auth User Found: ${userId}`);

        // 3. Sync to public.users (Since trigger is dead)
        console.log('2. Syncing to public.users...');
        await prisma.$executeRawUnsafe(`
      INSERT INTO public.users (
        id, email, full_name, password_hash, dni, role, is_active, accepted_terms, created_at, municipality_id
      )
      VALUES (
        '${userId}',
        '${targetEmail}',
        'Docencia Informatica',
        'SUPABASE_AUTH_MANAGED',
        'DNI-DOCENCIA-001',
        'USER', -- Default role
        true,
        true,
        now(),
        (SELECT id FROM public.municipalities LIMIT 1) -- Assign default municipality to prevent NULL errors
      )
      ON CONFLICT (id) DO UPDATE SET
        email_confirmed_at = now(),
        is_active = true,
        accepted_terms = true;
    `);

        console.log('✅ User Unblocked & Synced! They can now login.');

    } catch (error) {
        console.error('❌ Error executing manual confirm:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
