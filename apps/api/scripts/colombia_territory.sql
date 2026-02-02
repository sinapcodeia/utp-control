-- SCRIPT PARA CARGAR DEPARTAMENTOS Y MUNICIPIOS DE COLOMBIA
-- UTP CONTROL INTELLIGENCE

-- 1. LIMPIEZA PREVIA (Opcional, precaución con datos existentes)
-- DELETE FROM municipalities;
-- DELETE FROM regions;

-- 2. CARGA DE DEPARTAMENTOS (REGIONS)
INSERT INTO regions (id, name, code) VALUES
('DEPT-05', 'Antioquia', 'ANT'),
('DEPT-08', 'Atlántico', 'ATL'),
('DEPT-11', 'Bogotá D.C.', 'BOG'),
('DEPT-13', 'Bolívar', 'BOL'),
('DEPT-15', 'Boyacá', 'BOY'),
('DEPT-17', 'Caldas', 'CAL'),
('DEPT-18', 'Caquetá', 'CAQ'),
('DEPT-19', 'Cauca', 'CAU'),
('DEPT-20', 'Cesar', 'CES'),
('DEPT-23', 'Córdoba', 'COR'),
('DEPT-25', 'Cundinamarca', 'CUN'),
('DEPT-27', 'Chocó', 'CHO'),
('DEPT-41', 'Huila', 'HUI'),
('DEPT-44', 'La Guajira', 'LAG'),
('DEPT-47', 'Magdalena', 'MAG'),
('DEPT-50', 'Meta', 'MET'),
('DEPT-52', 'Nariño', 'NAR'),
('DEPT-54', 'Norte de Santander', 'NSA'),
('DEPT-63', 'Quindío', 'QUI'),
('DEPT-66', 'Risaralda', 'RIS'),
('DEPT-68', 'Santander', 'SAN'),
('DEPT-70', 'Sucre', 'SUC'),
('DEPT-73', 'Tolima', 'TOL'),
('DEPT-76', 'Valle del Cauca', 'VAC'),
('DEPT-81', 'Arauca', 'ARA'),
('DEPT-85', 'Casanare', 'CAS'),
('DEPT-86', 'Putumayo', 'PUT'),
('DEPT-88', 'San Andrés', 'SAP'),
('DEPT-91', 'Amazonas', 'AMA'),
('DEPT-94', 'Guainía', 'GUA'),
('DEPT-95', 'Guaviare', 'GUV'),
('DEPT-97', 'Vaupés', 'VAU'),
('DEPT-99', 'Vichada', 'VIC')
ON CONFLICT (code) DO NOTHING;

-- 3. CARGA DE MUNICIPIOS PRINCIPALES (MUNICIPALITIES)
INSERT INTO municipalities (id, name, region_id) VALUES
-- ANTIOQUIA
(gen_random_uuid(), 'Medellín', 'DEPT-05'),
(gen_random_uuid(), 'Bello', 'DEPT-05'),
(gen_random_uuid(), 'Itagüí', 'DEPT-05'),
(gen_random_uuid(), 'Envigado', 'DEPT-05'),
(gen_random_uuid(), 'Apartadó', 'DEPT-05'),
(gen_random_uuid(), 'Rionegro', 'DEPT-05'),
(gen_random_uuid(), 'Caucasia', 'DEPT-05'),

-- ATLANTICO
(gen_random_uuid(), 'Barranquilla', 'DEPT-08'),
(gen_random_uuid(), 'Soledad', 'DEPT-08'),
(gen_random_uuid(), 'Malambo', 'DEPT-08'),
(gen_random_uuid(), 'Sabanalarga', 'DEPT-08'),

-- BOGOTA
(gen_random_uuid(), 'Bogotá D.C.', 'DEPT-11'),

-- BOLIVAR
(gen_random_uuid(), 'Cartagena de Indias', 'DEPT-13'),
(gen_random_uuid(), 'Magangué', 'DEPT-13'),
(gen_random_uuid(), 'Turbaco', 'DEPT-13'),

-- BOYACA
(gen_random_uuid(), 'Tunja', 'DEPT-15'),
(gen_random_uuid(), 'Duitama', 'DEPT-15'),
(gen_random_uuid(), 'Sogamoso', 'DEPT-15'),

-- CALDAS
(gen_random_uuid(), 'Manizales', 'DEPT-17'),
(gen_random_uuid(), 'La Dorada', 'DEPT-17'),

-- CAUCA
(gen_random_uuid(), 'Popayán', 'DEPT-19'),
(gen_random_uuid(), 'Santander de Quilichao', 'DEPT-19'),

-- CESAR
(gen_random_uuid(), 'Valledupar', 'DEPT-20'),
(gen_random_uuid(), 'Aguachica', 'DEPT-20'),

-- CORDOBA
(gen_random_uuid(), 'Montería', 'DEPT-23'),
(gen_random_uuid(), 'Cereté', 'DEPT-23'),

-- CUNDINAMARCA
(gen_random_uuid(), 'Soacha', 'DEPT-25'),
(gen_random_uuid(), 'Fusagasugá', 'DEPT-25'),
(gen_random_uuid(), 'Facatativá', 'DEPT-25'),
(gen_random_uuid(), 'Chía', 'DEPT-25'),
(gen_random_uuid(), 'Zipaquirá', 'DEPT-25'),

-- HUILA
(gen_random_uuid(), 'Neiva', 'DEPT-41'),
(gen_random_uuid(), 'Pitalito', 'DEPT-41'),

-- LA GUAJIRA
(gen_random_uuid(), 'Riohacha', 'DEPT-44'),
(gen_random_uuid(), 'Maicao', 'DEPT-44'),

-- MAGDALENA
(gen_random_uuid(), 'Santa Marta', 'DEPT-47'),
(gen_random_uuid(), 'Ciénaga', 'DEPT-47'),

-- META
(gen_random_uuid(), 'Villavicencio', 'DEPT-50'),
(gen_random_uuid(), 'Acacías', 'DEPT-50'),

-- NARIÑO
(gen_random_uuid(), 'Pasto', 'DEPT-52'),
(gen_random_uuid(), 'Tumaco', 'DEPT-52'),

-- NORTE DE SANTANDER
(gen_random_uuid(), 'Cúcuta', 'DEPT-54'),
(gen_random_uuid(), 'Ocaña', 'DEPT-54'),

-- QUINDIO
(gen_random_uuid(), 'Armenia', 'DEPT-63'),

-- RISARALDA
(gen_random_uuid(), 'Pereira', 'DEPT-66'),
(gen_random_uuid(), 'Dosquebradas', 'DEPT-66'),

-- SANTANDER
(gen_random_uuid(), 'Bucaramanga', 'DEPT-68'),
(gen_random_uuid(), 'Floridablanca', 'DEPT-68'),
(gen_random_uuid(), 'Girón', 'DEPT-68'),
(gen_random_uuid(), 'Piedecuesta', 'DEPT-68'),
(gen_random_uuid(), 'Barrancabermeja', 'DEPT-68'),

-- SUCRE
(gen_random_uuid(), 'Sincelejo', 'DEPT-70'),

-- TOLIMA
(gen_random_uuid(), 'Ibagué', 'DEPT-73'),
(gen_random_uuid(), 'Espinal', 'DEPT-73'),

-- VALLE DEL CAUCA
(gen_random_uuid(), 'Cali', 'DEPT-76'),
(gen_random_uuid(), 'Buenaventura', 'DEPT-76'),
(gen_random_uuid(), 'Palmira', 'DEPT-76'),
(gen_random_uuid(), 'Tuluá', 'DEPT-76'),
(gen_random_uuid(), 'Yumbo', 'DEPT-76'),
(gen_random_uuid(), 'Cartago', 'DEPT-76'),
(gen_random_uuid(), 'Buga', 'DEPT-76'),

-- ARAUCA
(gen_random_uuid(), 'Arauca', 'DEPT-81'),

-- CASANARE
(gen_random_uuid(), 'Yopal', 'DEPT-85'),

-- PUTUMAYO
(gen_random_uuid(), 'Mocoa', 'DEPT-86'),

-- AMAZONAS
(gen_random_uuid(), 'Leticia', 'DEPT-91'),

-- VICHADA
(gen_random_uuid(), 'Puerto Carreño', 'DEPT-99')
ON CONFLICT (region_id, name) DO NOTHING;
