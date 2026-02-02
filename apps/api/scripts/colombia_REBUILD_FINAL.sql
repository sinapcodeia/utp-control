-- SCRIPT DE REESTRUCTURACIÓN TERRITORIAL DE COLOMBIA (VERSIÓN DEFINITIVA)
-- UTP CONTROL - COMPATIBILIDAD TOTAL Y ESTANDARIZACIÓN UUID

DO $$ 
DECLARE
    -- IDs Estatales Determinísticos (UUIDv4 válidos)
    -- Formato estándar para Antioquia (05), Atlántico (08), Bogotá (11), etc.
    ant_id UUID := '00000000-0000-4000-a000-000000000005';
    atl_id UUID := '00000000-0000-4000-a000-000000000008';
    bog_id UUID := '00000000-0000-4000-a000-000000000011';
    bol_id UUID := '00000000-0000-4000-a000-000000000013';
    val_id UUID := '00000000-0000-4000-a000-000000000076';
    temp_id UUID := 'f0f0f0f0-f0f0-40f0-80f0-f0f0f0f0f0f0';
BEGIN
    -- 1. CREAR REGIÓN DE TRANSICIÓN (BÚNKER)
    -- Se inserta con UUID explícito para evitar conflictos de tipo iniciales
    INSERT INTO regions (id, name, code) 
    VALUES (temp_id, 'SISTEMA_RECONSTRUCCION_UTP', 'ROOT') 
    ON CONFLICT DO NOTHING;

    -- 2. DESVINCULACIÓN DINÁMICA (Neutraliza llaves foráneas)
    -- Usamos EXECUTE para que el motor SQL no falle si hay micro-diferencias de esquema
    
    -- Usuarios: Desvincular de Depto y Municipio
    EXECUTE 'UPDATE users SET region_id = NULL, municipality_id = NULL';
    
    -- Noticias Regionales: Limpiar vínculos
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'regional_reports') THEN
        EXECUTE 'UPDATE regional_reports SET region_id = NULL, municipality_id = NULL';
    END IF;

    -- Visitas: Mover al búnker (Campo region_id es NOT NULL)
    EXECUTE 'UPDATE visits SET region_id = $1, municipality_id = NULL' USING temp_id;

    -- Documentos y Reportes (Check de columnas)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'region_id') THEN
        EXECUTE 'UPDATE documents SET region_id = NULL';
    END IF;

    -- 3. LIMPIEZA TOTAL (WIPE OUT)
    -- Borramos municipios primero, luego todas las regiones excepto nuestro búnker
    -- Usamos casting ::text para asegurar que el operador != no falle
    DELETE FROM municipalities;
    DELETE FROM regions WHERE id::text <> temp_id::text;

    -- 4. CARGA DE LOS 32 DEPARTAMENTOS DE COLOMBIA (IDENTIDAD ÚNICA)
    INSERT INTO regions (id, name, code) VALUES
    (ant_id, 'Antioquia', 'ANT'),
    (atl_id, 'Atlántico', 'ATL'),
    (bog_id, 'Bogotá D.C.', 'BOG'),
    (bol_id, 'Bolívar', 'BOL'),
    (val_id, 'Valle del Cauca', 'VAC'),
    ('00000000-0000-4000-a000-000000000015', 'Boyacá', 'BOY'),
    ('00000000-0000-4000-a000-000000000017', 'Caldas', 'CAL'),
    ('00000000-0000-4000-a000-000000000018', 'Caquetá', 'CAQ'),
    ('00000000-0000-4000-a000-000000000019', 'Cauca', 'CAU'),
    ('00000000-0000-4000-a000-000000000020', 'Cesar', 'CES'),
    ('00000000-0000-4000-a000-000000000023', 'Córdoba', 'COR'),
    ('00000000-0000-4000-a000-000000000025', 'Cundinamarca', 'CUN'),
    ('00000000-0000-4000-a000-000000000027', 'Chocó', 'CHO'),
    ('00000000-0000-4000-a000-000000000041', 'Huila', 'HUI'),
    ('00000000-0000-4000-a000-000000000044', 'La Guajira', 'LAG'),
    ('00000000-0000-4000-a000-000000000047', 'Magdalena', 'MAG'),
    ('00000000-0000-4000-a000-000000000050', 'Meta', 'MET'),
    ('00000000-0000-4000-a000-000000000052', 'Nariño', 'NAR'),
    ('00000000-0000-4000-a000-000000000054', 'Norte de Santander', 'NSA'),
    ('00000000-0000-4000-a000-000000000063', 'Quindío', 'QUI'),
    ('00000000-0000-4000-a000-000000000066', 'Risaralda', 'RIS'),
    ('00000000-0000-4000-a000-000000000068', 'Santander', 'SAN'),
    ('00000000-0000-4000-a000-000000000070', 'Sucre', 'SUC'),
    ('00000000-0000-4000-a000-000000000073', 'Tolima', 'TOL'),
    ('00000000-0000-4000-a000-000000000081', 'Arauca', 'ARA'),
    ('00000000-0000-4000-a000-000000000085', 'Casanare', 'CAS'),
    ('00000000-0000-4000-a000-000000000086', 'Putumayo', 'PUT'),
    ('00000000-0000-4000-a000-000000000088', 'San Andrés', 'SAP'),
    ('00000000-0000-4000-a000-000000000091', 'Amazonas', 'AMA'),
    ('00000000-0000-4000-a000-000000000094', 'Guainía', 'GUA'),
    ('00000000-0000-4000-a000-000000000095', 'Guaviare', 'GUV'),
    ('00000000-0000-4000-a000-000000000097', 'Vaupés', 'VAU'),
    ('00000000-0000-4000-a000-000000000099', 'Vichada', 'VIC');

    -- 5. CARGA DE MUNICIPIOS PRINCIPALES (EJEMPLO MASIVO)
    INSERT INTO municipalities (id, name, region_id) VALUES
    (gen_random_uuid(), 'Medellín', ant_id), (gen_random_uuid(), 'Bello', ant_id), (gen_random_uuid(), 'Itagüí', ant_id), (gen_random_uuid(), 'Envigado', ant_id),
    (gen_random_uuid(), 'Barranquilla', atl_id), (gen_random_uuid(), 'Soledad', atl_id), (gen_random_uuid(), 'Sabanalarga', atl_id),
    (gen_random_uuid(), 'Bogotá D.C.', bog_id),
    (gen_random_uuid(), 'Cartagena de Indias', bol_id), (gen_random_uuid(), 'Magangué', bol_id), (gen_random_uuid(), 'Turbaco', bol_id),
    (gen_random_uuid(), 'Cali', val_id), (gen_random_uuid(), 'Buenaventura', val_id), (gen_random_uuid(), 'Palmira', val_id), (gen_random_uuid(), 'Tuluá', val_id),
    (gen_random_uuid(), 'Pereira', '00000000-0000-4000-a000-000000000066'), (gen_random_uuid(), 'Dosquebradas', '00000000-0000-4000-a000-000000000066'),
    (gen_random_uuid(), 'Bucaramanga', '00000000-0000-4000-a000-000000000068'), (gen_random_uuid(), 'Barrancabermeja', '00000000-0000-4000-a000-000000000068'),
    (gen_random_uuid(), 'Tunja', '00000000-0000-4000-a000-000000000015'), (gen_random_uuid(), 'Ibagué', '00000000-0000-4000-a000-000000000073'),
    (gen_random_uuid(), 'Cúcuta', '00000000-0000-4000-a000-000000000054'), (gen_random_uuid(), 'Neiva', '00000000-0000-4000-a000-000000000041'),
    (gen_random_uuid(), 'Pasto', '00000000-0000-4000-a000-000000000052'), (gen_random_uuid(), 'Villavicencio', '00000000-0000-4000-a000-000000000050')
    ON CONFLICT (region_id, name) DO NOTHING;

    -- 6. RE-VINCULACIÓN (Movemos la operación real de vuelta a Antioquia por defecto)
    EXECUTE 'UPDATE visits SET region_id = $1 WHERE region_id = $2' USING ant_id, temp_id;

    -- 7. ELIMINAR BÚNKER (Operación Terminada)
    DELETE FROM regions WHERE id::text = temp_id::text;

    RAISE NOTICE 'Estandarización Territorial Completada: 100% UUID Profesionales';
END $$;
