-- Script de Carga de Datos Geográficos de Colombia
-- Autor: UTP Control AI
-- Descripción: Carga Departamentos (Regiones), Municipios y Veredas.

-- 1. Ajustes de Esquema (DDL) para asegurar que ON CONFLICT funcione
-- Eliminamos la restricción antigua de nombre único global en municipios si existe
ALTER TABLE municipalities DROP CONSTRAINT IF EXISTS municipalities_name_key;

-- Aseguramos que exista la tabla de Veredas (ya que la migración falló)
CREATE TABLE IF NOT EXISTS veredas (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    municipality_id TEXT NOT NULL REFERENCES municipalities(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Aseguramos que exista la restricción única compuesta (Región + Nombre)
CREATE UNIQUE INDEX IF NOT EXISTS municipalities_region_id_name_key ON municipalities(region_id, name);

-- Aseguramos que exista la restricción única en el nombre de la región
CREATE UNIQUE INDEX IF NOT EXISTS regions_name_key ON regions(name);

-- Aseguramos índice único para veredas
CREATE UNIQUE INDEX IF NOT EXISTS veredas_municipality_id_name_key ON veredas(municipality_id, name);

-- 2. Insertar Departamentos (Regions)
-- Usamos ON CONFLICT para evitar duplicados si se corre varias veces
INSERT INTO regions (id, name, code) VALUES 
(gen_random_uuid(), 'Amazonas', '91'),
(gen_random_uuid(), 'Antioquia', '05'),
(gen_random_uuid(), 'Arauca', '81'),
(gen_random_uuid(), 'Atlántico', '08'),
(gen_random_uuid(), 'Bolívar', '13'),
(gen_random_uuid(), 'Boyacá', '15'),
(gen_random_uuid(), 'Caldas', '17'),
(gen_random_uuid(), 'Caquetá', '18'),
(gen_random_uuid(), 'Casanare', '85'),
(gen_random_uuid(), 'Cauca', '19'),
(gen_random_uuid(), 'Cesar', '20'),
(gen_random_uuid(), 'Chocó', '27'),
(gen_random_uuid(), 'Córdoba', '23'),
(gen_random_uuid(), 'Cundinamarca', '25'),
(gen_random_uuid(), 'Guainía', '94'),
(gen_random_uuid(), 'Guaviare', '95'),
(gen_random_uuid(), 'Huila', '41'),
(gen_random_uuid(), 'La Guajira', '44'),
(gen_random_uuid(), 'Magdalena', '47'),
(gen_random_uuid(), 'Meta', '50'),
(gen_random_uuid(), 'Nariño', '52'),
(gen_random_uuid(), 'Norte de Santander', '54'),
(gen_random_uuid(), 'Putumayo', '86'),
(gen_random_uuid(), 'Quindío', '63'),
(gen_random_uuid(), 'Risaralda', '66'),
(gen_random_uuid(), 'San Andrés y Providencia', '88'),
(gen_random_uuid(), 'Santander', '68'),
(gen_random_uuid(), 'Sucre', '70'),
(gen_random_uuid(), 'Tolima', '73'),
(gen_random_uuid(), 'Valle del Cauca', '76'),
(gen_random_uuid(), 'Vaupés', '97'),
(gen_random_uuid(), 'Vichada', '99'),
(gen_random_uuid(), 'Bogotá D.C.', '11')
ON CONFLICT (name) DO UPDATE SET code = EXCLUDED.code;

-- 3. Insertar Municipios (Ejemplos Principales)
-- Se enlazan dinámicamente con el ID de la región usando el NOMBRE (Más seguro)

-- Antioquia (05)
INSERT INTO municipalities (id, name, region_id) VALUES
(gen_random_uuid(), 'Medellín', (SELECT id FROM regions WHERE name = 'Antioquia')),
(gen_random_uuid(), 'Bello', (SELECT id FROM regions WHERE name = 'Antioquia')),
(gen_random_uuid(), 'Itagüí', (SELECT id FROM regions WHERE name = 'Antioquia')),
(gen_random_uuid(), 'Envigado', (SELECT id FROM regions WHERE name = 'Antioquia'))
ON CONFLICT (region_id, name) DO NOTHING;

-- Cundinamarca (25) y Bogotá (11)
INSERT INTO municipalities (id, name, region_id) VALUES
(gen_random_uuid(), 'Bogotá', (SELECT id FROM regions WHERE name = 'Bogotá D.C.')),
(gen_random_uuid(), 'Soacha', (SELECT id FROM regions WHERE name = 'Cundinamarca')),
(gen_random_uuid(), 'Zipaquirá', (SELECT id FROM regions WHERE name = 'Cundinamarca'))
ON CONFLICT (region_id, name) DO NOTHING;

-- Valle del Cauca (76)
INSERT INTO municipalities (id, name, region_id) VALUES
(gen_random_uuid(), 'Cali', (SELECT id FROM regions WHERE name = 'Valle del Cauca')),
(gen_random_uuid(), 'Palmira', (SELECT id FROM regions WHERE name = 'Valle del Cauca')),
(gen_random_uuid(), 'Buenaventura', (SELECT id FROM regions WHERE name = 'Valle del Cauca'))
ON CONFLICT (region_id, name) DO NOTHING;

-- Atlántico (08)
INSERT INTO municipalities (id, name, region_id) VALUES
(gen_random_uuid(), 'Barranquilla', (SELECT id FROM regions WHERE name = 'Atlántico')),
(gen_random_uuid(), 'Soledad', (SELECT id FROM regions WHERE name = 'Atlántico'))
ON CONFLICT (region_id, name) DO NOTHING;

-- 4. Insertar Veredas (Ejemplos)
-- Nota: Colombia tiene más de 30,000 veredas. Este formato permite carga masiva.

-- Veredas de Medellín
INSERT INTO veredas (id, name, municipality_id) VALUES
(gen_random_uuid(), 'Santa Elena', (SELECT id FROM municipalities WHERE name = 'Medellín')),
(gen_random_uuid(), 'San Cristóbal', (SELECT id FROM municipalities WHERE name = 'Medellín')),
(gen_random_uuid(), 'Altavista', (SELECT id FROM municipalities WHERE name = 'Medellín')),
(gen_random_uuid(), 'San Antonio de Prado', (SELECT id FROM municipalities WHERE name = 'Medellín')),
(gen_random_uuid(), 'Palmitas', (SELECT id FROM municipalities WHERE name = 'Medellín'))
ON CONFLICT (municipality_id, name) DO NOTHING;

-- Veredas de Bogotá (Rural)
INSERT INTO veredas (id, name, municipality_id) VALUES
(gen_random_uuid(), 'Pasquilla', (SELECT id FROM municipalities WHERE name = 'Bogotá')),
(gen_random_uuid(), 'Mochuelo', (SELECT id FROM municipalities WHERE name = 'Bogotá')),
(gen_random_uuid(), 'El Verjón', (SELECT id FROM municipalities WHERE name = 'Bogotá'))
ON CONFLICT (municipality_id, name) DO NOTHING;

-- Instrucciones para carga masiva:
-- Si tienes un CSV con (NombreVereda, NombreMunicipio), puedes generar líneas INSERT masivas siguiendo este patrón:
-- INSERT INTO veredas (id, name, municipality_id) VALUES (gen_random_uuid(), 'NOMBRE_VEREDA', (SELECT id FROM municipalities WHERE name = 'NOMBRE_MUNICIPIO'));
