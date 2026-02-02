-- SCRIPT DE SINCRONIZACIÓN DEFINITIVA - UTP CONTROL
-- Copia y pega esto en el SQL Editor de Supabase para activar todas las funciones.

-- 1. Soporte para Áreas Manuales y Agendamiento en Visitas
ALTER TABLE visits ADD COLUMN IF NOT EXISTS area TEXT;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS vereda TEXT;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS citizen_id TEXT;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS assigned_to TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS assigned_by TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Soporte para Anexos en Comunicados y Alertas
ALTER TABLE regional_reports ADD COLUMN IF NOT EXISTS attachment_url TEXT;
ALTER TABLE regional_reports ADD COLUMN IF NOT EXISTS title TEXT;

-- 3. Asegurar tipos de datos para IDs (si no existen o cambiaron)
-- Nota: Prisma maneja los mapeos, pero la base de datos debe tener las columnas.

-- 4. Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_visits_assigned_to ON visits(assigned_to);
CREATE INDEX IF NOT EXISTS idx_regional_reports_region ON regional_reports(region_id);

SELECT 'Sincronización de esquema completada exitosamente' as resultado;
