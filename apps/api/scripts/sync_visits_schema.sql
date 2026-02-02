-- ACTUALIZACIÓN DE TABLA VISITS PARA SOPORTE DE ÁREAS MANUALES
-- Ejecutar en Supabase SQL Editor

ALTER TABLE visits ADD COLUMN IF NOT EXISTS area TEXT;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS vereda TEXT;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS citizen_id TEXT;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS assigned_to TEXT;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS assigned_by TEXT;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Comentario: Estos campos son necesarios para el nuevo flujo de agendamiento 
-- y para soportar municipios que no están en la lista oficial (campo area).
