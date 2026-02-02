const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log(' applying supabase-sync.sql ...');
        const sqlPath = path.join(__dirname, '..', 'supabase-sync.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Split by ';' might be dangerous for functions, but let's try executeRawUnsafe with the whole block.
        // Usually works for CREATE FUNCTION if it's one block.
        // But the file has multiple statements: CREATE FUNCTION ..., DROP TRIGGER ..., CREATE TRIGGER ...

        // We will split by valid separator or just execute the whole thing if the driver supports multiple statements.
        // Prisma executeRaw might not support multiple statements in one go depending on config.
        // Best to split manually.

        // Actually, the file uses $$ delimiters.
        // Let's split by the comments or specific markers.

        const statements = [
            `CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (
    id, 
    email, 
    full_name, 
    password_hash, 
    dni, 
    role, 
    is_active, 
    permissions, 
    created_at
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    'SUPABASE_AUTH_MANAGED',
    COALESCE(new.raw_user_meta_data->>'dni', 'SYNC-' || substr(new.id::text, 1, 8)),
    'USER',
    true,
    '{
      "dir": {"view": true, "edit": false, "delete": false},
      "news": {"view": true, "edit": false, "create": false, "edit_own": false, "edit_all": false, "delete": false},
      "staff": {"invite": false, "manage_perms": false, "block": false},
      "territory": {"allRegions": false, "regions": []}
    }'::jsonb,
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`,

            `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;`,

            `CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`
        ];

        for (const stmt of statements) {
            console.log('Executing:', stmt.substring(0, 50) + '...');
            await prisma.$executeRawUnsafe(stmt);
        }

        console.log('Successfully updated trigger function.');

    } catch (e) {
        console.error('Error applying SQL:', e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
