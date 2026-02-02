-- 1. Agregar columna de horario programado a la tabla de visitas
ALTER TABLE visits ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE;

-- 2. Limpiar visitas previas del administrador (opcional, para orden)
DELETE FROM visits WHERE assigned_to = (SELECT id::text FROM users WHERE email = 'antonio_rburgos@msn.com');

-- 3. Asignar 3 visitas operativas al Gestor correcto
-- Nota: Usamos los IDs de región y municipio estándar del seed
DO $$
DECLARE
    v_user_id TEXT;
    v_region_id TEXT := 'REG-ANT-001';
    v_mun_id TEXT := 'MUN-MED-001';
BEGIN
    SELECT id::text INTO v_user_id FROM users WHERE email = 'antoniorodriguezutep@gmail.com';

    IF v_user_id IS NOT NULL THEN
        INSERT INTO visits (id, full_name, address_text, status, priority, region_id, municipality_id, assigned_to, scheduled_at, created_at, updated_at)
        VALUES 
            (gen_random_uuid(), 'UP San José (Campo)', 'Vereda Central km 4', 'PENDING', 'MEDIUM', v_region_id, v_mun_id, v_user_id, NOW() + interval '2 hours', NOW(), NOW()),
            (gen_random_uuid(), 'UP El Carmen (Operativo)', 'Sector Norte Brisas', 'PENDING', 'HIGH', v_region_id, v_mun_id, v_user_id, NOW() + interval '4 hours', NOW(), NOW()),
            (gen_random_uuid(), 'UP Las Flores (Ruta)', 'Calle Principal 12-45', 'PENDING', 'LOW', v_region_id, v_mun_id, v_user_id, NOW() + interval '6 hours', NOW(), NOW());
        
        RAISE NOTICE 'Visitas asignadas exitosamente a %', v_user_id;
    ELSE
        RAISE NOTICE 'No se encontró el usuario antoniorodriguezutep@gmail.com';
    END IF;
END $$;
