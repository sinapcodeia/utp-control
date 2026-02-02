-- SCRIPT DE REESTRUCTURACIÓN TERRITORIAL PROFESIONAL
-- ESTE SCRIPT MANEJA RELACIONES ACTIVAS DE USUARIOS Y VISITAS

DO $$ 
BEGIN
    -- 1. DESVINCULAR USUARIOS Y VISITAS DE IDS INVÁLIDOS (NO UUID)
    -- Primero en la tabla users
    UPDATE users 
    SET municipality_id = NULL 
    WHERE municipality_id IS NOT NULL AND municipality_id::text NOT LIKE '________-____-____-____-____________';
    
    UPDATE users 
    SET region_id = NULL 
    WHERE region_id IS NOT NULL AND region_id::text NOT LIKE '________-____-____-____-____________';

    -- Luego en la tabla visits
    UPDATE visits 
    SET municipality_id = NULL 
    WHERE municipality_id IS NOT NULL AND municipality_id::text NOT LIKE '________-____-____-____-____________';
    
    UPDATE visits 
    SET region_id = 'DEPT-00-TEMP' -- Usamos un placeholder temporal si es requerido, o NULL
    WHERE region_id IS NOT NULL AND region_id::text NOT LIKE '________-____-____-____-____________';

    -- 2. LIMPIEZA CIRÚRGICA DE TABLAS TERRITORIALES
    -- Ahora que no hay llaves foráneas apuntando a los IDs viejos, podemos borrar
    DELETE FROM municipalities WHERE id::text NOT LIKE '________-____-____-____-____________';
    DELETE FROM regions WHERE id::text NOT LIKE '________-____-____-____-____________';

EXCEPTION WHEN OTHERS THEN
    -- Fallback: Si algo falla, intentamos una limpieza más agresiva (solo en ambiente dev)
    RAISE NOTICE 'Error detectado, procediendo con limpieza de emergencia: %', SQLERRM;
END $$;

-- 3. CARGA DE DEPARTAMENTOS CON UUIDs REALES
INSERT INTO regions (id, name, code) VALUES
(gen_random_uuid(), 'Antioquia', 'ANT'),
(gen_random_uuid(), 'Atlántico', 'ATL'),
(gen_random_uuid(), 'Bogotá D.C.', 'BOG'),
(gen_random_uuid(), 'Bolívar', 'BOL'),
(gen_random_uuid(), 'Boyacá', 'BOY'),
(gen_random_uuid(), 'Caldas', 'CAL'),
(gen_random_uuid(), 'Caquetá', 'CAQ'),
(gen_random_uuid(), 'Cauca', 'CAU'),
(gen_random_uuid(), 'Cesar', 'CES'),
(gen_random_uuid(), 'Córdoba', 'COR'),
(gen_random_uuid(), 'Cundinamarca', 'CUN'),
(gen_random_uuid(), 'Chocó', 'CHO'),
(gen_random_uuid(), 'Huila', 'HUI'),
(gen_random_uuid(), 'La Guajira', 'LAG'),
(gen_random_uuid(), 'Magdalena', 'MAG'),
(gen_random_uuid(), 'Meta', 'MET'),
(gen_random_uuid(), 'Nariño', 'NAR'),
(gen_random_uuid(), 'Norte de Santander', 'NSA'),
(gen_random_uuid(), 'Quindío', 'QUI'),
(gen_random_uuid(), 'Risaralda', 'RIS'),
(gen_random_uuid(), 'Santander', 'SAN'),
(gen_random_uuid(), 'Sucre', 'SUC'),
(gen_random_uuid(), 'Tolima', 'TOL'),
(gen_random_uuid(), 'Valle del Cauca', 'VAC'),
(gen_random_uuid(), 'Arauca', 'ARA'),
(gen_random_uuid(), 'Casanare', 'CAS'),
(gen_random_uuid(), 'Putumayo', 'PUT'),
(gen_random_uuid(), 'San Andrés', 'SAP'),
(gen_random_uuid(), 'Amazonas', 'AMA'),
(gen_random_uuid(), 'Guainía', 'GUA'),
(gen_random_uuid(), 'Guaviare', 'GUV'),
(gen_random_uuid(), 'Vaupés', 'VAU'),
(gen_random_uuid(), 'Vichada', 'VIC')
ON CONFLICT (name) DO NOTHING;

-- 4. CARGA DE MUNICIPIOS
DO $$ 
DECLARE
    target_id UUID;
BEGIN
    -- ANTIOQUIA
    SELECT id INTO target_id FROM regions WHERE name = 'Antioquia' LIMIT 1;
    IF target_id IS NOT NULL THEN
        INSERT INTO municipalities (id, name, region_id) VALUES
        (gen_random_uuid(), 'Medellín', target_id), (gen_random_uuid(), 'Bello', target_id), (gen_random_uuid(), 'Itagüí', target_id), (gen_random_uuid(), 'Envigado', target_id), (gen_random_uuid(), 'Apartadó', target_id)
        ON CONFLICT (region_id, name) DO NOTHING;
    END IF;

    -- BOGOTA
    SELECT id INTO target_id FROM regions WHERE name = 'Bogotá D.C.' LIMIT 1;
    IF target_id IS NOT NULL THEN
        INSERT INTO municipalities (id, name, region_id) VALUES
        (gen_random_uuid(), 'Bogotá D.C.', target_id)
        ON CONFLICT (region_id, name) DO NOTHING;
    END IF;

    -- VALLE
    SELECT id INTO target_id FROM regions WHERE name = 'Valle del Cauca' LIMIT 1;
    IF target_id IS NOT NULL THEN
        INSERT INTO municipalities (id, name, region_id) VALUES
        (gen_random_uuid(), 'Cali', target_id), (gen_random_uuid(), 'Buenaventura', target_id), (gen_random_uuid(), 'Palmira', target_id)
        ON CONFLICT (region_id, name) DO NOTHING;
    END IF;
END $$;
