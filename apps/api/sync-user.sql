-- 1. Crear Región por defecto si no existe
INSERT INTO regions (id, name, code)
VALUES (gen_random_uuid(), 'Región Central', 'REG-CEN')
ON CONFLICT (name) DO NOTHING;

-- 2. Crear Municipio por defecto si no existe
INSERT INTO municipalities (id, name, region_id)
SELECT gen_random_uuid(), 'Municipio Central', id
FROM regions
WHERE name = 'Región Central'
ON CONFLICT (region_id, name) DO NOTHING;

-- 3. Insertar/Actualizar Usuario Antonio
-- Nota: Se usa un DNI único para evitar conflictos
INSERT INTO users (
    id, 
    email, 
    full_name, 
    dni, 
    password_hash, 
    role, 
    is_active, 
    region_id, 
    municipality_id, 
    permissions, 
    accepted_terms, 
    accepted_at,
    created_at
)
VALUES (
    gen_random_uuid(), 
    'antonio_rburgos@msn.com', 
    'Antonio Burgos', 
    'DNI-ANTONIO-001', 
    'SUPABASE_AUTH_MANAGED', 
    'ADMIN', 
    true, 
    (SELECT id FROM regions WHERE name = 'Región Central' LIMIT 1),
    (SELECT id FROM municipalities WHERE name = 'Municipio Central' LIMIT 1),
    '{"dir": {"view": true, "edit": true, "delete": true}, "news": {"view": true, "edit": true, "create": true, "edit_own": true, "edit_all": true, "delete": true}, "staff": {"invite": true, "manage_perms": true, "block": true}}'::jsonb,
    true, 
    now(),
    now()
)
ON CONFLICT (email) DO UPDATE SET
    role = 'ADMIN',
    is_active = true,
    full_name = 'Antonio Burgos',
    permissions = '{"dir": {"view": true, "edit": true, "delete": true}, "news": {"view": true, "edit": true, "create": true, "edit_own": true, "edit_all": true, "delete": true}, "staff": {"invite": true, "manage_perms": true, "block": true}}'::jsonb;
