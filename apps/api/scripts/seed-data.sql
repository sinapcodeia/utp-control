-- Script SQL para cargar datos de ejemplo en español
-- Ejecutar con: psql o Supabase SQL Editor

-- 1. Crear Región (Garantiza Antioquia con ID Estándar)
INSERT INTO regions (id, name, code) 
VALUES ('00000000-0000-4000-a000-000000000005', 'Antioquia', 'ANT')
ON CONFLICT (name) DO NOTHING;

-- 2. Crear Municipio
INSERT INTO municipalities (id, name, region_id)
VALUES (gen_random_uuid()::text, 'Medellín', '00000000-0000-4000-a000-000000000005')
ON CONFLICT (region_id, name) DO NOTHING;

-- 3. Crear Usuario Administrador
INSERT INTO users (id, email, password_hash, full_name, dni, role, region_id, municipality_id, is_active, permissions, accepted_terms)
VALUES ('U-001', 'admin@utp.gov', 'dummy_hash', 'Administrador Regional', '123456789', 'ADMIN', '00000000-0000-4000-a000-000000000005', NULL, true, '{}', true)
ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email,
    region_id = '00000000-0000-4000-a000-000000000005', 
    municipality_id = NULL,
    role = 'ADMIN',
    is_active = true;

-- 4. Crear Informes Oficiales
INSERT INTO reports (id, code, type, format, url, hash_sha256, generated_by, region_id, metadata, generated_at)
VALUES 
  ('REP-001', 'INF-ANT-2026-001', 'REGIONAL', 'PDF', 'https://example.com/informe-antioquia.pdf', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'U-001', '00000000-0000-4000-a000-000000000005', '{"titulo": "Balance Operativo Antioquia Q1-2026"}', NOW()),
  ('REP-002', 'AUD-NAC-2026-001', 'AUDIT', 'XLSX', 'https://example.com/auditoria.xlsx', '8860714157c91f13bf691438964d00977e5e9b972e26922d3e0992a549557618', 'U-001', NULL, '{"titulo": "Auditoría Nacional de Cumplimiento"}', NOW())
ON CONFLICT (id) DO NOTHING;

-- 5. Crear Noticias Regionales
INSERT INTO regional_reports (id, user_id, region_id, category, priority, content, created_at)
VALUES
  ('NEWS-001', 'U-001', '00000000-0000-4000-a000-000000000005', 'SECURITY', 'HIGH', 'ALERTA TÁCTICA: Se ha incrementado la vigilancia en nodos críticos de Antioquia. Mantener comunicación constante con central.', NOW()),
  ('NEWS-002', 'U-001', NULL, 'HEALTH', 'MEDIUM', 'AVISO NACIONAL: Actualización de protocolos bioseguridad para misiones en campo.', NOW())
ON CONFLICT (id) DO NOTHING;

-- Verificar inserciones
SELECT 'Regiones:', COUNT(*) FROM regions;
SELECT 'Municipios:', COUNT(*) FROM municipalities;
SELECT 'Usuarios:', COUNT(*) FROM users;
SELECT 'Informes:', COUNT(*) FROM reports;
SELECT 'Noticias:', COUNT(*) FROM regional_reports;
