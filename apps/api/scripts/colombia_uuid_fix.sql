-- SCRIPT DE EMERGENCIA: LIMPIEZA Y REUBICACIÓN TERRITORIAL
-- ESTE SCRIPT REALINEA LOS IDS PARA QUE SEAN COMPATIBLES CON TODO EL SISTEMA

DO $$ 
BEGIN
    -- 1. Si existen departamentos con IDs que no son UUID (como los REG-ANT-001 que causan error)
    -- Los eliminamos para que el sistema use IDs válidos de tipo UUID.
    -- OJO: Esto solo se hace si el ID no es un UUID válido.
    DELETE FROM regions WHERE id::text NOT LIKE '________-____-____-____-____________';
    DELETE FROM municipalities WHERE id::text NOT LIKE '________-____-____-____-____________';

EXCEPTION WHEN OTHERS THEN
    -- Si falla la conversión, simplemente limpiamos lo básico para permitir la carga nueva
    DELETE FROM municipalities;
    DELETE FROM regions;
END $$;

-- 2. CARGA LIMPIA CON IDS UUID (PostgreSQL Estándar)
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

-- 3. CARGA DE MUNICIPIOS CON BÚSQUEDA SEGURA
DO $$ 
DECLARE
    target_id UUID;
BEGIN
    -- ANTIOQUIA
    SELECT id INTO target_id FROM regions WHERE name = 'Antioquia' LIMIT 1;
    IF target_id IS NOT NULL THEN
        INSERT INTO municipalities (id, name, region_id) VALUES
        (gen_random_uuid(), 'Medellín', target_id), (gen_random_uuid(), 'Bello', target_id), (gen_random_uuid(), 'Itagüí', target_id), (gen_random_uuid(), 'Envigado', target_id),
        (gen_random_uuid(), 'Apartadó', target_id), (gen_random_uuid(), 'Rionegro', target_id), (gen_random_uuid(), 'Caucasia', target_id), (gen_random_uuid(), 'Turbo', target_id)
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
        (gen_random_uuid(), 'Cali', target_id), (gen_random_uuid(), 'Buenaventura', target_id), (gen_random_uuid(), 'Palmira', target_id), (gen_random_uuid(), 'Tuluá', target_id)
        ON CONFLICT (region_id, name) DO NOTHING;
    END IF;

    -- RISARALDA
    SELECT id INTO target_id FROM regions WHERE name = 'Risaralda' LIMIT 1;
    IF target_id IS NOT NULL THEN
        INSERT INTO municipalities (id, name, region_id) VALUES
        (gen_random_uuid(), 'Pereira', target_id), (gen_random_uuid(), 'Dosquebradas', target_id), (gen_random_uuid(), 'Santa Rosa de Cabal', target_id)
        ON CONFLICT (region_id, name) DO NOTHING;
    END IF;

    -- SANTANDER
    SELECT id INTO target_id FROM regions WHERE name = 'Santander' LIMIT 1;
    IF target_id IS NOT NULL THEN
        INSERT INTO municipalities (id, name, region_id) VALUES
        (gen_random_uuid(), 'Bucaramanga', target_id), (gen_random_uuid(), 'Barrancabermeja', target_id), (gen_random_uuid(), 'Floridablanca', target_id)
        ON CONFLICT (region_id, name) DO NOTHING;
    END IF;

END $$;
