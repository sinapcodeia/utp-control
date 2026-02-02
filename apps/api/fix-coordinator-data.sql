-- 1. Asignar Región Central al Coordinador
INSERT INTO "_UserAssignedRegions" ("A", "B")
SELECT r.id, u.id 
FROM regions r, users u 
WHERE r.name = 'Región Central' AND u.email = 'coord@test.com'
ON CONFLICT DO NOTHING;

-- 2. Asegurar que existe la Región Central
INSERT INTO regions (id, name, code)
VALUES (gen_random_uuid(), 'Región Central', 'REG-CEN')
ON CONFLICT (name) DO NOTHING;

-- 3. Crear algunos reportes regionales para la Región Central (para que las stats no sean 0)
INSERT INTO regional_reports (id, user_id, region_id, category, priority, title, content, created_at)
SELECT 
    gen_random_uuid(),
    u.id,
    r.id,
    'SECURITY',
    'HIGH',
    'Alerta de Seguridad',
    'Bloqueo en vía principal: Se reporta manifestación pacífica.',
    now() - interval '2 hours'
FROM users u, regions r
WHERE u.email = 'coord@test.com' AND r.name = 'Región Central'
LIMIT 1;

INSERT INTO regional_reports (id, user_id, region_id, category, priority, title, content, created_at)
SELECT 
    gen_random_uuid(),
    u.id,
    r.id,
    'CLIMATE',
    'MEDIUM',
    'Alerta Climática',
    'Lluvias fuertes pronosticadas para la tarde.',
    now() - interval '5 hours'
FROM users u, regions r
WHERE u.email = 'coord@test.com' AND r.name = 'Región Central'
LIMIT 1;

-- 4. Crear Alertas vinculadas
INSERT INTO alerts (id, report_id, priority, status, created_at)
SELECT 
    gen_random_uuid(),
    rr.id,
    'HIGH',
    'NEW',
    now()
FROM regional_reports rr
WHERE rr.title = 'Alerta de Seguridad'
LIMIT 1;

-- 5. Asegurar algunos usuarios en la región (Fuerza Operativa)
UPDATE users 
SET region_id = (SELECT id FROM regions WHERE name = 'Región Central')
WHERE email IN ('gestor@test.com', 'admin@test.com');
