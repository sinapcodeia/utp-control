-- SCRIPT PARA CREAR COMUNICADO DE PRUEBA CON ANEXO
-- Ejecutar en Supabase SQL Editor

INSERT INTO regional_reports (id, user_id, region_id, category, priority, title, content, attachment_url, created_at)
VALUES (
    gen_random_uuid(), 
    (SELECT id FROM users LIMIT 1), -- Toma el primer usuario disponible (Admin)
    NULL, -- Nacional
    'SECURITY', 
    'HIGH', 
    'DIRECTIVA DE SEGURIDAD NACIONAL 001', 
    'Se ordena a todos los gestores de campo revisar el nuevo protocolo de seguridad en zonas críticas y portar el carné de identificación en lugar visible.', 
    'https://www.policia.gov.co/sites/default/files/documento-de-prueba.pdf', -- URL de ejemplo real
    NOW()
)
ON CONFLICT DO NOTHING;
