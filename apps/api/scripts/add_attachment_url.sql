-- ACTUALIZACIÓN DE ESQUEMA: SOPORTE PARA ANEXOS EN COMUNICADOS
-- Ejecutar en Supabase SQL Editor

ALTER TABLE regional_reports ADD COLUMN IF NOT EXISTS attachment_url TEXT;

-- Comentario: Campo agregado exitosamente para soportar documentos adjuntos.
