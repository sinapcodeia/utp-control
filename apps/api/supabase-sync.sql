-- Función para manejar la creación de nuevos usuarios desde auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para ejecutar la función después de un INSERT en auth.users
-- NOTA: Si la sincronización es manual, este trigger puede ser deshabilitado o ejecutado bajo demanda.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
