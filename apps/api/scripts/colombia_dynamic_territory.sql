-- SCRIPT TERRITORIAL FINAL (A PRUEBA DE ERRORES)
-- CARGA DINÁMICA DE MUNICIPIOS BASADA EN NOMBRES DE DEPARTAMENTO

-- 1. Asegurar Departamentos (Si no existen)
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

-- 2. Función auxiliar para insertar municipios buscando el ID de la región por nombre
-- Esto evita errores de Foreign Key si el ID ya existía previamente
DO $$ 
DECLARE
    r_id UUID;
BEGIN
    -- ANTIOQUIA
    SELECT id INTO r_id FROM regions WHERE name = 'Antioquia' LIMIT 1;
    IF r_id IS NOT NULL THEN
        INSERT INTO municipalities (id, name, region_id) VALUES
        (gen_random_uuid(), 'Medellín', r_id), (gen_random_uuid(), 'Abejorral', r_id), (gen_random_uuid(), 'Abriaquí', r_id), (gen_random_uuid(), 'Alejandría', r_id),
        (gen_random_uuid(), 'Amagá', r_id), (gen_random_uuid(), 'Amalfi', r_id), (gen_random_uuid(), 'Andes', r_id), (gen_random_uuid(), 'Angelópolis', r_id),
        (gen_random_uuid(), 'Apartadó', r_id), (gen_random_uuid(), 'Bello', r_id), (gen_random_uuid(), 'Caldas', r_id), (gen_random_uuid(), 'Caucasia', r_id),
        (gen_random_uuid(), 'Envigado', r_id), (gen_random_uuid(), 'Itagüí', r_id), (gen_random_uuid(), 'Rionegro', r_id), (gen_random_uuid(), 'Sabaneta', r_id)
        ON CONFLICT (region_id, name) DO NOTHING;
    END IF;

    -- ATLANTICO
    SELECT id INTO r_id FROM regions WHERE name = 'Atlántico' LIMIT 1;
    IF r_id IS NOT NULL THEN
        INSERT INTO municipalities (id, name, region_id) VALUES
        (gen_random_uuid(), 'Barranquilla', r_id), (gen_random_uuid(), 'Soledad', r_id), (gen_random_uuid(), 'Malambo', r_id), (gen_random_uuid(), 'Puerto Colombia', r_id)
        ON CONFLICT (region_id, name) DO NOTHING;
    END IF;

    -- BOGOTA
    SELECT id INTO r_id FROM regions WHERE name = 'Bogotá D.C.' LIMIT 1;
    IF r_id IS NOT NULL THEN
        INSERT INTO municipalities (id, name, region_id) VALUES
        (gen_random_uuid(), 'Bogotá D.C.', r_id)
        ON CONFLICT (region_id, name) DO NOTHING;
    END IF;

    -- VALLE DEL CAUCA
    SELECT id INTO r_id FROM regions WHERE name = 'Valle del Cauca' LIMIT 1;
    IF r_id IS NOT NULL THEN
        INSERT INTO municipalities (id, name, region_id) VALUES
        (gen_random_uuid(), 'Cali', r_id), (gen_random_uuid(), 'Buenaventura', r_id), (gen_random_uuid(), 'Palmira', r_id), (gen_random_uuid(), 'Tuluá', r_id)
        ON CONFLICT (region_id, name) DO NOTHING;
    END IF;

    -- CUNDINAMARCA
    SELECT id INTO r_id FROM regions WHERE name = 'Cundinamarca' LIMIT 1;
    IF r_id IS NOT NULL THEN
        INSERT INTO municipalities (id, name, region_id) VALUES
        (gen_random_uuid(), 'Soacha', r_id), (gen_random_uuid(), 'Chía', r_id), (gen_random_uuid(), 'Zipaquirá', r_id), (gen_random_uuid(), 'Girardot', r_id)
        ON CONFLICT (region_id, name) DO NOTHING;
    END IF;

    -- SANTANDER
    SELECT id INTO r_id FROM regions WHERE name = 'Santander' LIMIT 1;
    IF r_id IS NOT NULL THEN
        INSERT INTO municipalities (id, name, region_id) VALUES
        (gen_random_uuid(), 'Bucaramanga', r_id), (gen_random_uuid(), 'Barrancabermeja', r_id), (gen_random_uuid(), 'Floridablanca', r_id)
        ON CONFLICT (region_id, name) DO NOTHING;
    END IF;

END $$;
