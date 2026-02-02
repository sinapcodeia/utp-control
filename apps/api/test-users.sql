-- Script para insertar usuarios de prueba en public.users
-- Nota: Estos usuarios deben existir en auth.users para poder iniciar sesión.
-- Se recomienda crearlos vía "Registrarse" en la UI con la contraseña: UTPControl2026!

-- 1. Usuario ADMIN (Acceso Total)
INSERT INTO public.users (id, email, full_name, password_hash, dni, role, is_active, permissions, created_at)
VALUES (
    gen_random_uuid(), 
    'admin@test.com', 
    'Admin de Prueba', 
    'SUPABASE_AUTH_MANAGED', 
    'TEST-ADMIN-001', 
    'ADMIN', 
    true, 
    '{
      "dir": {"view": true, "edit": true, "delete": true}, 
      "news": {"view": true, "edit": true, "create": true, "edit_own": true, "edit_all": true, "delete": true}, 
      "staff": {"invite": true, "manage_perms": true, "block": true}, 
      "territory": {"allRegions": true, "regions": []}
    }'::jsonb,
    now()
) ON CONFLICT (email) DO UPDATE SET role = 'ADMIN', permissions = EXCLUDED.permissions;

-- 2. Usuario COORDINADOR (Multi-Región)
-- Este coordinador tiene acceso a la Región Central y otra región si existiera.
INSERT INTO public.users (id, email, full_name, password_hash, dni, role, is_active, permissions, region_id, created_at)
VALUES (
    gen_random_uuid(), 
    'coord@test.com', 
    'Coordinador Multi-Región', 
    'SUPABASE_AUTH_MANAGED', 
    'TEST-COORD-001', 
    'COORDINATOR', 
    true, 
    '{
      "dir": {"view": true, "edit": true, "delete": false}, 
      "news": {"view": true, "edit": true, "create": true, "edit_own": true, "edit_all": false, "delete": true}, 
      "staff": {"invite": true, "manage_perms": false, "block": false}, 
      "territory": {"allRegions": false, "regions": []}
    }'::jsonb,
    (SELECT id FROM regions WHERE name = 'Región Central' LIMIT 1),
    now()
) ON CONFLICT (email) DO UPDATE SET role = 'COORDINATOR', permissions = EXCLUDED.permissions;

-- 3. Usuario GESTOR (Solo su región)
INSERT INTO public.users (id, email, full_name, password_hash, dni, role, is_active, permissions, region_id, created_at)
VALUES (
    gen_random_uuid(), 
    'gestor@test.com', 
    'Gestor de Prueba', 
    'SUPABASE_AUTH_MANAGED', 
    'TEST-GESTOR-001', 
    'USER', 
    true, 
    '{
      "dir": {"view": true, "edit": false, "delete": false}, 
      "news": {"view": true, "edit": false, "create": false, "edit_own": false, "edit_all": false, "delete": false}, 
      "staff": {"invite": false, "manage_perms": false, "block": false}, 
      "territory": {"allRegions": false, "regions": []}
    }'::jsonb,
    (SELECT id FROM regions WHERE name = 'Región Central' LIMIT 1),
    now()
) ON CONFLICT (email) DO UPDATE SET role = 'USER', permissions = EXCLUDED.permissions;

-- 4. Vincular regiones al coordinador (Ejemplo manual)
-- INSERT INTO "_UserAssignedRegions" ("A", "B")
-- SELECT r.id, u.id FROM regions r, users u WHERE r.name = 'Región Central' AND u.email = 'coord@test.com'
-- ON CONFLICT DO NOTHING;
