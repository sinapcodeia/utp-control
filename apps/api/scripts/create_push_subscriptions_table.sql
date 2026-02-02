-- =====================================================
-- SCRIPT: Crear tabla push_subscriptions
-- FECHA: 2026-01-31
-- PROPÓSITO: Habilitar notificaciones push en el sistema
-- =====================================================

-- Crear tabla si no existe
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    expiration_time DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key a users
    CONSTRAINT fk_push_subscriptions_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE
);

-- Índices para optimizar queries
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id 
    ON push_subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_created_at 
    ON push_subscriptions(created_at);

-- Comentarios para documentación
COMMENT ON TABLE push_subscriptions IS 'Suscripciones de usuarios a notificaciones push';
COMMENT ON COLUMN push_subscriptions.endpoint IS 'URL del endpoint de push del navegador';
COMMENT ON COLUMN push_subscriptions.p256dh IS 'Clave pública del cliente para encriptación';
COMMENT ON COLUMN push_subscriptions.auth IS 'Token de autenticación del cliente';
COMMENT ON COLUMN push_subscriptions.expiration_time IS 'Timestamp de expiración de la suscripción';

-- Verificar creación
SELECT 'Tabla push_subscriptions creada exitosamente' AS status;
