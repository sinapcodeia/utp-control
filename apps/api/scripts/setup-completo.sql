-- ========================================
-- SCRIPT COMPLETO: ESQUEMA + DATOS
-- ========================================
-- Ejecutar este script en Supabase SQL Editor
-- para crear las tablas e insertar datos de ejemplo

-- ========================================
-- PARTE 1: CREAR ENUMS Y TABLAS
-- ========================================

-- 1. Crear ENUMS
DO $$ BEGIN
    CREATE TYPE "Role" AS ENUM ('ADMIN', 'COORDINATOR', 'USER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ReportType" AS ENUM ('GENERAL', 'REGIONAL', 'ALERT', 'AUDIT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ReportFormat" AS ENUM ('PDF', 'XLSX', 'DOCX');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "DeliveryChannel" AS ENUM ('EMAIL', 'WHATSAPP', 'DOWNLOAD');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "NewsCategory" AS ENUM ('CLIMATE', 'SECURITY', 'PUBLIC_ORDER', 'HEALTH', 'INFRASTRUCTURE', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Crear tablas base
CREATE TABLE IF NOT EXISTS regions (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    code TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS municipalities (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    region_id TEXT NOT NULL REFERENCES regions(id)
);

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    dni TEXT UNIQUE NOT NULL,
    phone TEXT,
    role "Role" DEFAULT 'USER' NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    permissions JSONB DEFAULT '{}' NOT NULL,
    region_id TEXT REFERENCES regions(id),
    municipality_id TEXT REFERENCES municipalities(id),
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    last_login TIMESTAMP,
    accepted_terms BOOLEAN DEFAULT false NOT NULL,
    accepted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id TEXT NOT NULL REFERENCES users(id),
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    ip_address TEXT,
    metadata JSONB,
    timestamp TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    version INTEGER DEFAULT 1 NOT NULL,
    hash TEXT,
    uploader_id TEXT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS document_comments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    document_id TEXT NOT NULL REFERENCES documents(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS regional_reports (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id TEXT NOT NULL REFERENCES users(id),
    region_id TEXT REFERENCES regions(id),
    municipality_id TEXT REFERENCES municipalities(id),
    category "NewsCategory" NOT NULL,
    priority "Priority" NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS alerts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    report_id TEXT NOT NULL REFERENCES regional_reports(id),
    priority "Priority" NOT NULL,
    status TEXT DEFAULT 'NEW' NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    code TEXT UNIQUE NOT NULL,
    type "ReportType" NOT NULL,
    format "ReportFormat" NOT NULL,
    url TEXT NOT NULL,
    hash_sha256 TEXT NOT NULL,
    generated_by TEXT NOT NULL REFERENCES users(id),
    authorized_by TEXT REFERENCES users(id),
    region_id TEXT REFERENCES regions(id),
    municipality_id TEXT REFERENCES municipalities(id),
    metadata JSONB,
    generated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS report_deliveries (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    report_id TEXT NOT NULL REFERENCES reports(id),
    recipient TEXT NOT NULL,
    channel "DeliveryChannel" NOT NULL,
    status TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS news_read_receipts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id TEXT NOT NULL REFERENCES users(id),
    report_id TEXT NOT NULL REFERENCES regional_reports(id),
    read_at TIMESTAMP DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, report_id)
);

-- ========================================
-- PARTE 2: INSERTAR DATOS DE EJEMPLO
-- ========================================

-- 1. Crear Región
INSERT INTO regions (id, name, code) 
VALUES ('REG-ANT-001', 'Antioquia', 'ANT')
ON CONFLICT (code) DO NOTHING;

-- 2. Crear Municipio
INSERT INTO municipalities (id, name, region_id)
VALUES ('MUN-MED-001', 'Medellín', 'REG-ANT-001')
ON CONFLICT (name) DO NOTHING;

-- 3. Crear Usuario Administrador
INSERT INTO users (id, email, password_hash, full_name, dni, role, region_id, municipality_id, is_active, permissions, accepted_terms)
VALUES ('U-001', 'admin@utp.gov', 'dummy_hash', 'Administrador Regional', '123456789', 'ADMIN', 'REG-ANT-001', 'MUN-MED-001', true, '{}', true)
ON CONFLICT (email) DO UPDATE SET region_id = 'REG-ANT-001', municipality_id = 'MUN-MED-001';

-- 4. Crear Informes Oficiales
INSERT INTO reports (id, code, type, format, url, hash_sha256, generated_by, region_id, metadata, generated_at)
VALUES 
  ('REP-001', 'INF-ANT-2026-001', 'REGIONAL', 'PDF', 'https://example.com/informe-antioquia.pdf', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'U-001', 'REG-ANT-001', '{"titulo": "Balance Operativo Antioquia Q1-2026"}', NOW()),
  ('REP-002', 'AUD-NAC-2026-001', 'AUDIT', 'XLSX', 'https://example.com/auditoria.xlsx', '8860714157c91f13bf691438964d00977e5e9b972e26922d3e0992a549557618', 'U-001', NULL, '{"titulo": "Auditoría Nacional de Cumplimiento"}', NOW())
ON CONFLICT (code) DO NOTHING;

-- 5. Crear Noticias Regionales
INSERT INTO regional_reports (id, user_id, region_id, category, priority, content, created_at)
VALUES
  ('NEWS-001', 'U-001', 'REG-ANT-001', 'SECURITY', 'HIGH', 'ALERTA TÁCTICA: Se ha incrementado la vigilancia en nodos críticos de Antioquia. Mantener comunicación constante con central.', NOW()),
  ('NEWS-002', 'U-001', NULL, 'HEALTH', 'MEDIUM', 'AVISO NACIONAL: Actualización de protocolos bioseguridad para misiones en campo.', NOW())
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- VERIFICACIÓN FINAL
-- ========================================
SELECT 
    'Regiones' as tabla, COUNT(*)::TEXT as total FROM regions
UNION ALL
SELECT 'Municipios', COUNT(*)::TEXT FROM municipalities
UNION ALL
SELECT 'Usuarios', COUNT(*)::TEXT FROM users
UNION ALL
SELECT 'Informes', COUNT(*)::TEXT FROM reports
UNION ALL
SELECT 'Noticias', COUNT(*)::TEXT FROM regional_reports;
