-- SCRIPT REPARADO: CARGA TERRITORIAL COMPLETA COLOMBIA
-- SOLUCIÓN A ERRORES DE DUPLICADOS Y SINTAXIS

-- 1. DEPARTAMENTOS (Manejo de conflictos por NOMBRE y CÓDIGO)
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
ON CONFLICT (name) DO NOTHING;

-- 2. MUNICIPIOS (Corregido para evitar errores de sintaxis y duplicados)
-- Bloque 1: Antioquia
INSERT INTO municipalities (id, name, region_id) VALUES
(gen_random_uuid(), 'Medellín', 'DEPT-05'), (gen_random_uuid(), 'Abejorral', 'DEPT-05'), (gen_random_uuid(), 'Abriaquí', 'DEPT-05'), (gen_random_uuid(), 'Alejandría', 'DEPT-05'), (gen_random_uuid(), 'Amagá', 'DEPT-05'), (gen_random_uuid(), 'Amalfi', 'DEPT-05'), (gen_random_uuid(), 'Andes', 'DEPT-05'), (gen_random_uuid(), 'Angelópolis', 'DEPT-05'), (gen_random_uuid(), 'Angostura', 'DEPT-05'), (gen_random_uuid(), 'Anorí', 'DEPT-05'), (gen_random_uuid(), 'Anzá', 'DEPT-05'), (gen_random_uuid(), 'Apartadó', 'DEPT-05'), (gen_random_uuid(), 'Arboletes', 'DEPT-05'), (gen_random_uuid(), 'Argelia', 'DEPT-05'), (gen_random_uuid(), 'Armenia', 'DEPT-05'), (gen_random_uuid(), 'Barbosa', 'DEPT-05'), (gen_random_uuid(), 'Bello', 'DEPT-05'), (gen_random_uuid(), 'Belmira', 'DEPT-05'), (gen_random_uuid(), 'Betania', 'DEPT-05'), (gen_random_uuid(), 'Betulia', 'DEPT-05'), (gen_random_uuid(), 'Briceño', 'DEPT-05'), (gen_random_uuid(), 'Buriticá', 'DEPT-05'), (gen_random_uuid(), 'Cáceres', 'DEPT-05'), (gen_random_uuid(), 'Caicedo', 'DEPT-05'), (gen_random_uuid(), 'Caldas', 'DEPT-05'), (gen_random_uuid(), 'Campamento', 'DEPT-05'), (gen_random_uuid(), 'Cañasgordas', 'DEPT-05'), (gen_random_uuid(), 'Caracolí', 'DEPT-05'), (gen_random_uuid(), 'Caramanta', 'DEPT-05'), (gen_random_uuid(), 'Carepa', 'DEPT-05'), (gen_random_uuid(), 'Carmen de Viboral', 'DEPT-05'), (gen_random_uuid(), 'Carolina', 'DEPT-05'), (gen_random_uuid(), 'Caucasia', 'DEPT-05'), (gen_random_uuid(), 'Chigorodó', 'DEPT-05'), (gen_random_uuid(), 'Cisneros', 'DEPT-05'), (gen_random_uuid(), 'Ciudad Bolívar', 'DEPT-05'), (gen_random_uuid(), 'Cocorná', 'DEPT-05'), (gen_random_uuid(), 'Concepción', 'DEPT-05'), (gen_random_uuid(), 'Concordia', 'DEPT-05'), (gen_random_uuid(), 'Copacabana', 'DEPT-05'), (gen_random_uuid(), 'Dabeiba', 'DEPT-05'), (gen_random_uuid(), 'Don Matías', 'DEPT-05'), (gen_random_uuid(), 'Ebéjico', 'DEPT-05'), (gen_random_uuid(), 'El Bagre', 'DEPT-05'), (gen_random_uuid(), 'El Carmen de Viboral', 'DEPT-05'), (gen_random_uuid(), 'El Santuario', 'DEPT-05'), (gen_random_uuid(), 'Entrerríos', 'DEPT-05'), (gen_random_uuid(), 'Envigado', 'DEPT-05'), (gen_random_uuid(), 'Fredonia', 'DEPT-05'), (gen_random_uuid(), 'Frontino', 'DEPT-05'), (gen_random_uuid(), 'Giraldo', 'DEPT-05'), (gen_random_uuid(), 'Girardota', 'DEPT-05'), (gen_random_uuid(), 'Gómez Plata', 'DEPT-05'), (gen_random_uuid(), 'Granada', 'DEPT-05'), (gen_random_uuid(), 'Guadalupe', 'DEPT-05'), (gen_random_uuid(), 'Guarne', 'DEPT-05'), (gen_random_uuid(), 'Guatapé', 'DEPT-05'), (gen_random_uuid(), 'Heliconia', 'DEPT-05'), (gen_random_uuid(), 'Hispania', 'DEPT-05'), (gen_random_uuid(), 'Itagüí', 'DEPT-05'), (gen_random_uuid(), 'Ituango', 'DEPT-05'), (gen_random_uuid(), 'Jardín', 'DEPT-05'), (gen_random_uuid(), 'Jericó', 'DEPT-05'), (gen_random_uuid(), 'La Ceja', 'DEPT-05'), (gen_random_uuid(), 'La Estrella', 'DEPT-05'), (gen_random_uuid(), 'La Pintada', 'DEPT-05'), (gen_random_uuid(), 'La Unión', 'DEPT-05'), (gen_random_uuid(), 'Liborina', 'DEPT-05'), (gen_random_uuid(), 'Maceo', 'DEPT-05'), (gen_random_uuid(), 'Marinilla', 'DEPT-05'), (gen_random_uuid(), 'Montebello', 'DEPT-05'), (gen_random_uuid(), 'Murindó', 'DEPT-05'), (gen_random_uuid(), 'Mutatá', 'DEPT-05'), (gen_random_uuid(), 'Nariño', 'DEPT-05'), (gen_random_uuid(), 'Nechí', 'DEPT-05'), (gen_random_uuid(), 'Necoclí', 'DEPT-05'), (gen_random_uuid(), 'Olaya', 'DEPT-05'), (gen_random_uuid(), 'Peñol', 'DEPT-05'), (gen_random_uuid(), 'Peque', 'DEPT-05'), (gen_random_uuid(), 'Pueblorrico', 'DEPT-05'), (gen_random_uuid(), 'Puerto Berrío', 'DEPT-05'), (gen_random_uuid(), 'Puerto Nare', 'DEPT-05'), (gen_random_uuid(), 'Puerto Triunfo', 'DEPT-05'), (gen_random_uuid(), 'Remedios', 'DEPT-05'), (gen_random_uuid(), 'Retiro', 'DEPT-05'), (gen_random_uuid(), 'Rionegro', 'DEPT-05'), (gen_random_uuid(), 'Sabanalarga', 'DEPT-05'), (gen_random_uuid(), 'Sabaneta', 'DEPT-05'), (gen_random_uuid(), 'Salgar', 'DEPT-05'), (gen_random_uuid(), 'San Andrés de Cuerquia', 'DEPT-05'), (gen_random_uuid(), 'San Carlos', 'DEPT-05'), (gen_random_uuid(), 'San Francisco', 'DEPT-05'), (gen_random_uuid(), 'San Jerónimo', 'DEPT-05'), (gen_random_uuid(), 'San José de la Montaña', 'DEPT-05'), (gen_random_uuid(), 'San Juan de Urabá', 'DEPT-05'), (gen_random_uuid(), 'San Luis', 'DEPT-05'), (gen_random_uuid(), 'San Pedro de los Milagros', 'DEPT-05'), (gen_random_uuid(), 'San Pedro de Urabá', 'DEPT-05'), (gen_random_uuid(), 'San Rafael', 'DEPT-05'), (gen_random_uuid(), 'San Roque', 'DEPT-05'), (gen_random_uuid(), 'San Vicente', 'DEPT-05'), (gen_random_uuid(), 'Santa Bárbara', 'DEPT-05'), (gen_random_uuid(), 'Santa Fe de Antioquia', 'DEPT-05'), (gen_random_uuid(), 'Santa Rosa de Osos', 'DEPT-05'), (gen_random_uuid(), 'Santo Domingo', 'DEPT-05'), (gen_random_uuid(), 'Segovia', 'DEPT-05'), (gen_random_uuid(), 'Sonson', 'DEPT-05'), (gen_random_uuid(), 'Sopetrán', 'DEPT-05'), (gen_random_uuid(), 'Támesis', 'DEPT-05'), (gen_random_uuid(), 'Tarazá', 'DEPT-05'), (gen_random_uuid(), 'Tarso', 'DEPT-05'), (gen_random_uuid(), 'Titiribí', 'DEPT-05'), (gen_random_uuid(), 'Toledo', 'DEPT-05'), (gen_random_uuid(), 'Turbo', 'DEPT-05'), (gen_random_uuid(), 'Uramita', 'DEPT-05'), (gen_random_uuid(), 'Urrao', 'DEPT-05'), (gen_random_uuid(), 'Valdivia', 'DEPT-05'), (gen_random_uuid(), 'Valparaíso', 'DEPT-05'), (gen_random_uuid(), 'Vegachí', 'DEPT-05'), (gen_random_uuid(), 'Venecia', 'DEPT-05'), (gen_random_uuid(), 'Vigía del Fuerte', 'DEPT-05'), (gen_random_uuid(), 'Yalí', 'DEPT-05'), (gen_random_uuid(), 'Yarumal', 'DEPT-05'), (gen_random_uuid(), 'Yolombó', 'DEPT-05'), (gen_random_uuid(), 'Yondó', 'DEPT-05'), (gen_random_uuid(), 'Zaragoza', 'DEPT-05')
ON CONFLICT (region_id, name) DO NOTHING;

-- Bloque 2: Otros Departamentos Masivos
INSERT INTO municipalities (id, name, region_id) VALUES
(gen_random_uuid(), 'Barranquilla', 'DEPT-08'), (gen_random_uuid(), 'Soledad', 'DEPT-08'), (gen_random_uuid(), 'Sabanagrande', 'DEPT-08'),
(gen_random_uuid(), 'Bogotá D.C.', 'DEPT-11'),
(gen_random_uuid(), 'Cartagena', 'DEPT-13'), (gen_random_uuid(), 'Magangué', 'DEPT-13'), (gen_random_uuid(), 'Arjona', 'DEPT-13'),
(gen_random_uuid(), 'Tunja', 'DEPT-15'), (gen_random_uuid(), 'Duitama', 'DEPT-15'), (gen_random_uuid(), 'Sogamoso', 'DEPT-15'), (gen_random_uuid(), 'Chiquinquirá', 'DEPT-15'),
(gen_random_uuid(), 'Manizales', 'DEPT-17'), (gen_random_uuid(), 'Chinchiná', 'DEPT-17'), (gen_random_uuid(), 'Villamaría', 'DEPT-17'),
(gen_random_uuid(), 'Popayán', 'DEPT-19'), (gen_random_uuid(), 'Santander de Quilichao', 'DEPT-19'),
(gen_random_uuid(), 'Valledupar', 'DEPT-20'), (gen_random_uuid(), 'Aguachica', 'DEPT-20'),
(gen_random_uuid(), 'Montería', 'DEPT-23'), (gen_random_uuid(), 'Sahagún', 'DEPT-23'),
(gen_random_uuid(), 'Cali', 'DEPT-76'), (gen_random_uuid(), 'Palmira', 'DEPT-76'), (gen_random_uuid(), 'Buenaventura', 'DEPT-76'), (gen_random_uuid(), 'Tuluá', 'DEPT-76'), (gen_random_uuid(), 'Cartago', 'DEPT-76'), (gen_random_uuid(), 'Jamundí', 'DEPT-76'),
(gen_random_uuid(), 'Pereira', 'DEPT-66'), (gen_random_uuid(), 'Dosquebradas', 'DEPT-66'),
(gen_random_uuid(), 'Ibagué', 'DEPT-73'), (gen_random_uuid(), 'Espinal', 'DEPT-73'),
(gen_random_uuid(), 'Bucaramanga', 'DEPT-68'), (gen_random_uuid(), 'Floridablanca', 'DEPT-68'), (gen_random_uuid(), 'Girón', 'DEPT-68'), (gen_random_uuid(), 'Piedecuesta', 'DEPT-68'), (gen_random_uuid(), 'Barrancabermeja', 'DEPT-68'),
(gen_random_uuid(), 'Villavicencio', 'DEPT-50'), (gen_random_uuid(), 'Acacías', 'DEPT-50'),
(gen_random_uuid(), 'Neiva', 'DEPT-41'), (gen_random_uuid(), 'Pitalito', 'DEPT-41'),
(gen_random_uuid(), 'Santa Marta', 'DEPT-47'), (gen_random_uuid(), 'Ciénaga', 'DEPT-47'),
(gen_random_uuid(), 'Sincelejo', 'DEPT-70'), (gen_random_uuid(), 'Pasto', 'DEPT-52'), (gen_random_uuid(), 'Cúcuta', 'DEPT-54'),
(gen_random_uuid(), 'Soacha', 'DEPT-25'), (gen_random_uuid(), 'Chía', 'DEPT-25'), (gen_random_uuid(), 'Zipaquirá', 'DEPT-25'), (gen_random_uuid(), 'Facatativá', 'DEPT-25'), (gen_random_uuid(), 'Fusagasugá', 'DEPT-25'), (gen_random_uuid(), 'Madrid', 'DEPT-25'), (gen_random_uuid(), 'Mosquera', 'DEPT-25'), (gen_random_uuid(), 'Funza', 'DEPT-25'), (gen_random_uuid(), 'Cajicá', 'DEPT-25')
ON CONFLICT (region_id, name) DO NOTHING;
