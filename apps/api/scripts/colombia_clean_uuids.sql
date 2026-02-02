-- SCRIPT DE REESTRUCTURACIÓN TERRITORIAL (VERSIÓN ROBUSTA SIN ERRORES DE TIPO)
-- ESTE SCRIPT CORRIGE EL ERROR DE SINTAXIS UUID AL TRATAR TODO COMO TEXTO

DO $$ 
DECLARE
    -- Usamos TEXT en las variables para evitar errores si la DB tiene IDs antiguos tipo "REG-ANT-001"
    v_target_id TEXT;
BEGIN
    -- 1. DESVINCULAR USUARIOS Y VISITAS DE IDS ANTIGUOS
    -- Para evitar el error "invalid input syntax for type uuid", tratamos la columna como texto plano
    -- Nota: Usamos COALESCE para manejar nulos y comparamos como texto.
    
    UPDATE users 
    SET municipality_id = NULL 
    WHERE municipality_id IS NOT NULL 
    AND municipality_id::text NOT SIMILAR TO '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}';
    
    UPDATE users 
    SET region_id = NULL 
    WHERE region_id IS NOT NULL 
    AND region_id::text NOT SIMILAR TO '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}';

    UPDATE visits 
    SET municipality_id = NULL 
    WHERE municipality_id IS NOT NULL 
    AND municipality_id::text NOT SIMILAR TO '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}';

    UPDATE visits 
    SET region_id = NULL 
    WHERE region_id IS NOT NULL 
    AND region_id::text NOT SIMILAR TO '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}';

    -- 2. LIMPIEZA DE TABLAS TERRITORIALES
    -- Borramos municipios que no tengan un formato UUID válido
    DELETE FROM municipalities WHERE id::text NOT SIMILAR TO '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}';
    -- Borramos regiones que no tengan un formato UUID válido
    DELETE FROM regions WHERE id::text NOT SIMILAR TO '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}';

    -- 3. CARGA DE DEPARTAMENTOS (Crea nuevos con UUID reales)
    -- Si el departamento ya existe con UUID válido, ON CONFLICT se encargará de ignorarlo
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

    -- 4. CARGA DE MUNICIPIOS LÓGICA
    -- Antioquia
    SELECT id INTO v_target_id FROM regions WHERE name = 'Antioquia' LIMIT 1;
    IF v_target_id IS NOT NULL THEN
        INSERT INTO municipalities (id, name, region_id) VALUES
        (gen_random_uuid(), 'Medellín', v_target_id::uuid), (gen_random_uuid(), 'Bello', v_target_id::uuid), (gen_random_uuid(), 'Itagüí', v_target_id::uuid)
        ON CONFLICT (region_id, name) DO NOTHING;
    END IF;

    -- Bogotá
    SELECT id INTO v_target_id FROM regions WHERE name = 'Bogotá D.C.' LIMIT 1;
    IF v_target_id IS NOT NULL THEN
        INSERT INTO municipalities (id, name, region_id) VALUES
        (gen_random_uuid(), 'Bogotá D.C.', v_target_id::uuid)
        ON CONFLICT (region_id, name) DO NOTHING;
    END IF;

    -- Valle
    SELECT id INTO v_target_id FROM regions WHERE name = 'Valle del Cauca' LIMIT 1;
    IF v_target_id IS NOT NULL THEN
        INSERT INTO municipalities (id, name, region_id) VALUES
        (gen_random_uuid(), 'Cali', v_target_id::uuid), (gen_random_uuid(), 'Buenaventura', v_target_id::uuid)
        ON CONFLICT (region_id, name) DO NOTHING;
    END IF;

END $$;
