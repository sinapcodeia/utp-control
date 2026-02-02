-- Script para crear el esquema completo de la base de datos
-- Ejecutar PRIMERO este script, LUEGO el seed-data.sql

-- 1. Crear ENUMS (Idempotente)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN
        CREATE TYPE "Role" AS ENUM ('ADMIN', 'COORDINATOR', 'USER');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ReportType') THEN
        CREATE TYPE "ReportType" AS ENUM ('GENERAL', 'REGIONAL', 'ALERT', 'AUDIT');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ReportFormat') THEN
        CREATE TYPE "ReportFormat" AS ENUM ('PDF', 'XLSX', 'DOCX');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DeliveryChannel') THEN
        CREATE TYPE "DeliveryChannel" AS ENUM ('EMAIL', 'WHATSAPP', 'DOWNLOAD');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Priority') THEN
        CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'NewsCategory') THEN
        CREATE TYPE "NewsCategory" AS ENUM ('CLIMATE', 'SECURITY', 'PUBLIC_ORDER', 'HEALTH', 'INFRASTRUCTURE', 'OTHER');
    END IF;
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

-- 3. Mensaje de confirmación
SELECT 'Esquema creado exitosamente' AS status;
