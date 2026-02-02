
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📜 Applying Safe Trigger (Statement by Statement)...');

  const createFunctionSql = `
    CREATE OR REPLACE FUNCTION public.handle_new_user_simple()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO public.users (
        id, 
        email, 
        role, 
        is_active, 
        permissions, 
        password_hash,
        accepted_terms,
        accepted_at
      )
      VALUES (
        new.id,
        new.email,
        'USER',
        true,
        '{}'::jsonb,
        '', 
        COALESCE((new.raw_user_meta_data->>'accepted_terms')::boolean, false),
        (new.raw_user_meta_data->>'accepted_at')::timestamp with time zone
      )
      ON CONFLICT (id) DO UPDATE SET
        accepted_terms = EXCLUDED.accepted_terms,
        accepted_at = EXCLUDED.accepted_at;
      RETURN new;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Error in handle_new_user_simple: %', SQLERRM;
      RETURN new;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;

  const dropTriggerSql = `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;`;

  const createTriggerSql = `
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_simple();
  `;

  try {
    console.log('1. Creating Function...');
    await prisma.$executeRawUnsafe(createFunctionSql);

    console.log('2. Dropping old Trigger...');
    await prisma.$executeRawUnsafe(dropTriggerSql);

    console.log('3. Creating new Trigger...');
    await prisma.$executeRawUnsafe(createTriggerSql);

    console.log('✅ Trigger Restored Successfully!');
  } catch (e) {
    console.error('❌ Error applying trigger:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
