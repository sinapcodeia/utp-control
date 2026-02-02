-- ============================================================================
-- SCRIPT: POBLAR BÓVEDA DE INFORMES
-- Descripción: Crea informes de ejemplo categorizados por tipo
-- Fecha: 2026-01-29
-- Prioridad: P1
-- ============================================================================

-- Este script debe ejecutarse después de tener usuarios y regiones creados
-- Asume que ya existen:
-- - Usuarios con roles ADMIN, COORDINATOR, GESTOR
-- - Regiones configuradas
-- - Municipios configurados

-- ============================================================================
-- PASO 1: OBTENER IDs DE REFERENCIA
-- ============================================================================

-- Obtener ID de usuario ADMIN (generador de informes)
DO $$
DECLARE
    admin_id UUID;
    coordinator_id UUID;
    region_antioquia_id UUID;
    region_cundinamarca_id UUID;
    region_valle_id UUID;
    mun_medellin_id UUID;
    mun_bogota_id UUID;
    mun_cali_id UUID;
    report_counter INT := 1;
BEGIN
    -- Obtener usuarios
    SELECT id INTO admin_id FROM users WHERE role = 'ADMIN' LIMIT 1;
    SELECT id INTO coordinator_id FROM users WHERE role = 'COORDINATOR' LIMIT 1;
    
    -- Obtener regiones
    SELECT id INTO region_antioquia_id FROM regions WHERE code = 'ANT' LIMIT 1;
    SELECT id INTO region_cundinamarca_id FROM regions WHERE code = 'CUN' LIMIT 1;
    SELECT id INTO region_valle_id FROM regions WHERE code = 'VAL' LIMIT 1;
    
    -- Obtener municipios
    SELECT id INTO mun_medellin_id FROM municipalities WHERE name ILIKE '%medell%' LIMIT 1;
    SELECT id INTO mun_bogota_id FROM municipalities WHERE name ILIKE '%bogot%' LIMIT 1;
    SELECT id INTO mun_cali_id FROM municipalities WHERE name ILIKE '%cali%' LIMIT 1;

    RAISE NOTICE 'IDs obtenidos - Admin: %, Coordinator: %', admin_id, coordinator_id;
    RAISE NOTICE 'Regiones - Antioquia: %, Cundinamarca: %, Valle: %', region_antioquia_id, region_cundinamarca_id, region_valle_id;

    -- ============================================================================
    -- PASO 2: CREAR INFORMES REGIONALES (Visibles para COORDINATOR y ADMIN)
    -- ============================================================================
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CREANDO INFORMES REGIONALES';
    RAISE NOTICE '========================================';

    -- Informe Regional - Antioquia - Enero 2026
    INSERT INTO reports (
        id, code, type, format, url, hash_sha256,
        generated_by, region_id, municipality_id,
        metadata, generated_at
    ) VALUES (
        gen_random_uuid(),
        'INF-REG-ANT-2026-01-' || LPAD(report_counter::TEXT, 4, '0'),
        'REGIONAL',
        'PDF',
        'https://storage.utpcontrol.com/reports/regional/antioquia-enero-2026.pdf',
        encode(sha256('regional-antioquia-enero-2026'::bytea), 'hex'),
        admin_id,
        region_antioquia_id,
        mun_medellin_id,
        jsonb_build_object(
            'visibility', 'PUBLIC',
            'period', 'ENERO 2026',
            'category', 'MENSUAL',
            'summary', 'Informe mensual de gestión territorial Antioquia',
            'metrics', jsonb_build_object(
                'visitas_realizadas', 245,
                'cobertura', '87%',
                'alertas_criticas', 3,
                'cumplimiento', '94%'
            )
        ),
        NOW() - INTERVAL '5 days'
    );
    report_counter := report_counter + 1;

    -- Informe Regional - Cundinamarca - Enero 2026
    INSERT INTO reports (
        id, code, type, format, url, hash_sha256,
        generated_by, region_id, municipality_id,
        metadata, generated_at
    ) VALUES (
        gen_random_uuid(),
        'INF-REG-CUN-2026-01-' || LPAD(report_counter::TEXT, 4, '0'),
        'REGIONAL',
        'PDF',
        'https://storage.utpcontrol.com/reports/regional/cundinamarca-enero-2026.pdf',
        encode(sha256('regional-cundinamarca-enero-2026'::bytea), 'hex'),
        admin_id,
        region_cundinamarca_id,
        mun_bogota_id,
        jsonb_build_object(
            'visibility', 'PUBLIC',
            'period', 'ENERO 2026',
            'category', 'MENSUAL',
            'summary', 'Informe mensual de gestión territorial Cundinamarca',
            'metrics', jsonb_build_object(
                'visitas_realizadas', 312,
                'cobertura', '91%',
                'alertas_criticas', 2,
                'cumplimiento', '96%'
            )
        ),
        NOW() - INTERVAL '4 days'
    );
    report_counter := report_counter + 1;

    -- Informe Regional - Valle del Cauca - Enero 2026
    INSERT INTO reports (
        id, code, type, format, url, hash_sha256,
        generated_by, region_id, municipality_id,
        metadata, generated_at
    ) VALUES (
        gen_random_uuid(),
        'INF-REG-VAL-2026-01-' || LPAD(report_counter::TEXT, 4, '0'),
        'REGIONAL',
        'PDF',
        'https://storage.utpcontrol.com/reports/regional/valle-enero-2026.pdf',
        encode(sha256('regional-valle-enero-2026'::bytea), 'hex'),
        admin_id,
        region_valle_id,
        mun_cali_id,
        jsonb_build_object(
            'visibility', 'PUBLIC',
            'period', 'ENERO 2026',
            'category', 'MENSUAL',
            'summary', 'Informe mensual de gestión territorial Valle del Cauca',
            'metrics', jsonb_build_object(
                'visitas_realizadas', 198,
                'cobertura', '83%',
                'alertas_criticas', 5,
                'cumplimiento', '89%'
            )
        ),
        NOW() - INTERVAL '3 days'
    );
    report_counter := report_counter + 1;

    -- ============================================================================
    -- PASO 3: CREAR INFORMES DE AUDITORÍA (Solo ADMIN)
    -- ============================================================================
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CREANDO INFORMES DE AUDITORÍA';
    RAISE NOTICE '========================================';

    -- Informe de Auditoría - Sistema - Enero 2026
    INSERT INTO reports (
        id, code, type, format, url, hash_sha256,
        generated_by, region_id, municipality_id,
        metadata, generated_at
    ) VALUES (
        gen_random_uuid(),
        'INF-AUD-SYS-2026-01-' || LPAD(report_counter::TEXT, 4, '0'),
        'AUDIT',
        'PDF',
        'https://storage.utpcontrol.com/reports/audit/sistema-enero-2026.pdf',
        encode(sha256('audit-sistema-enero-2026'::bytea), 'hex'),
        admin_id,
        NULL, -- Nacional
        NULL,
        jsonb_build_object(
            'visibility', 'RESTRICTED',
            'period', 'ENERO 2026',
            'category', 'SEGURIDAD',
            'summary', 'Auditoría de seguridad y accesos del sistema',
            'findings', jsonb_build_array(
                'Accesos no autorizados: 0',
                'Intentos de login fallidos: 12',
                'Cambios de permisos: 5',
                'Exportaciones de datos: 23'
            ),
            'recommendations', jsonb_build_array(
                'Implementar 2FA para usuarios ADMIN',
                'Revisar permisos de usuarios COORDINATOR',
                'Actualizar políticas de contraseñas'
            )
        ),
        NOW() - INTERVAL '2 days'
    );
    report_counter := report_counter + 1;

    -- Informe de Auditoría - Cumplimiento - Enero 2026
    INSERT INTO reports (
        id, code, type, format, url, hash_sha256,
        generated_by, region_id, municipality_id,
        metadata, generated_at
    ) VALUES (
        gen_random_uuid(),
        'INF-AUD-CMP-2026-01-' || LPAD(report_counter::TEXT, 4, '0'),
        'AUDIT',
        'PDF',
        'https://storage.utpcontrol.com/reports/audit/cumplimiento-enero-2026.pdf',
        encode(sha256('audit-cumplimiento-enero-2026'::bytea), 'hex'),
        admin_id,
        NULL, -- Nacional
        NULL,
        jsonb_build_object(
            'visibility', 'RESTRICTED',
            'period', 'ENERO 2026',
            'category', 'CUMPLIMIENTO',
            'summary', 'Auditoría de cumplimiento normativo ISO 27001',
            'compliance_score', 94,
            'areas_reviewed', jsonb_build_array(
                'Gestión de Accesos',
                'Protección de Datos',
                'Continuidad del Negocio',
                'Gestión de Incidentes'
            )
        ),
        NOW() - INTERVAL '1 day'
    );
    report_counter := report_counter + 1;

    -- ============================================================================
    -- PASO 4: CREAR INFORMES GENERALES (Nacionales - Todos los roles)
    -- ============================================================================
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CREANDO INFORMES GENERALES';
    RAISE NOTICE '========================================';

    -- Informe General - Consolidado Nacional - Enero 2026
    INSERT INTO reports (
        id, code, type, format, url, hash_sha256,
        generated_by, region_id, municipality_id,
        metadata, generated_at
    ) VALUES (
        gen_random_uuid(),
        'INF-GEN-NAC-2026-01-' || LPAD(report_counter::TEXT, 4, '0'),
        'GENERAL',
        'PDF',
        'https://storage.utpcontrol.com/reports/general/consolidado-nacional-enero-2026.pdf',
        encode(sha256('general-nacional-enero-2026'::bytea), 'hex'),
        admin_id,
        NULL, -- Nacional
        NULL,
        jsonb_build_object(
            'visibility', 'PUBLIC',
            'period', 'ENERO 2026',
            'category', 'CONSOLIDADO',
            'summary', 'Informe consolidado nacional de gestión territorial',
            'metrics', jsonb_build_object(
                'total_visitas', 755,
                'cobertura_nacional', '87%',
                'regiones_activas', 3,
                'alertas_criticas_total', 10,
                'cumplimiento_promedio', '93%'
            ),
            'highlights', jsonb_build_array(
                'Incremento del 12% en cobertura vs mes anterior',
                'Reducción del 8% en alertas críticas',
                'Mejora del 5% en cumplimiento de objetivos'
            )
        ),
        NOW() - INTERVAL '6 hours'
    );
    report_counter := report_counter + 1;

    -- Informe General - Indicadores de Desempeño
    INSERT INTO reports (
        id, code, type, format, url, hash_sha256,
        generated_by, region_id, municipality_id,
        metadata, generated_at
    ) VALUES (
        gen_random_uuid(),
        'INF-GEN-KPI-2026-01-' || LPAD(report_counter::TEXT, 4, '0'),
        'GENERAL',
        'XLSX',
        'https://storage.utpcontrol.com/reports/general/kpi-enero-2026.xlsx',
        encode(sha256('general-kpi-enero-2026'::bytea), 'hex'),
        admin_id,
        NULL, -- Nacional
        NULL,
        jsonb_build_object(
            'visibility', 'PUBLIC',
            'period', 'ENERO 2026',
            'category', 'KPI',
            'summary', 'Indicadores clave de desempeño nacional',
            'kpis', jsonb_build_object(
                'tiempo_respuesta_promedio', '2.3 horas',
                'satisfaccion_ciudadana', '4.2/5',
                'eficiencia_operativa', '91%',
                'tasa_resolucion', '87%'
            )
        ),
        NOW() - INTERVAL '3 hours'
    );
    report_counter := report_counter + 1;

    -- ============================================================================
    -- PASO 5: CREAR INFORMES DE ALERTAS (Visibles según prioridad)
    -- ============================================================================
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CREANDO INFORMES DE ALERTAS';
    RAISE NOTICE '========================================';

    -- Informe de Alerta - Crítica - Antioquia
    INSERT INTO reports (
        id, code, type, format, url, hash_sha256,
        generated_by, region_id, municipality_id,
        metadata, generated_at
    ) VALUES (
        gen_random_uuid(),
        'INF-ALR-ANT-2026-01-' || LPAD(report_counter::TEXT, 4, '0'),
        'ALERT',
        'PDF',
        'https://storage.utpcontrol.com/reports/alerts/antioquia-alerta-critica.pdf',
        encode(sha256('alert-antioquia-critica'::bytea), 'hex'),
        coordinator_id,
        region_antioquia_id,
        mun_medellin_id,
        jsonb_build_object(
            'visibility', 'PUBLIC',
            'priority', 'HIGH',
            'category', 'SEGURIDAD',
            'summary', 'Alerta de seguridad - Zona rural Medellín',
            'description', 'Situación de orden público requiere atención inmediata',
            'actions_required', jsonb_build_array(
                'Suspender visitas en zona afectada',
                'Coordinar con autoridades locales',
                'Evaluar reasignación de recursos'
            ),
            'status', 'ACTIVE'
        ),
        NOW() - INTERVAL '12 hours'
    );
    report_counter := report_counter + 1;

    -- ============================================================================
    -- PASO 6: CREAR INFORMES PRIVADOS (Solo para testing de filtrado)
    -- ============================================================================
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CREANDO INFORMES PRIVADOS';
    RAISE NOTICE '========================================';

    -- Informe Privado - Solo ADMIN y COORDINATOR de la región
    INSERT INTO reports (
        id, code, type, format, url, hash_sha256,
        generated_by, region_id, municipality_id,
        metadata, generated_at
    ) VALUES (
        gen_random_uuid(),
        'INF-REG-CUN-PRIV-2026-01-' || LPAD(report_counter::TEXT, 4, '0'),
        'REGIONAL',
        'PDF',
        'https://storage.utpcontrol.com/reports/regional/cundinamarca-privado.pdf',
        encode(sha256('regional-cundinamarca-privado'::bytea), 'hex'),
        admin_id,
        region_cundinamarca_id,
        NULL,
        jsonb_build_object(
            'visibility', 'RESTRICTED',
            'period', 'ENERO 2026',
            'category', 'ESTRATÉGICO',
            'summary', 'Informe estratégico confidencial - Solo ADMIN y COORDINATOR',
            'classification', 'CONFIDENCIAL',
            'access_level', 'RESTRICTED'
        ),
        NOW() - INTERVAL '1 hour'
    );

    RAISE NOTICE '========================================';
    RAISE NOTICE 'POBLACIÓN COMPLETADA';
    RAISE NOTICE 'Total de informes creados: %', report_counter;
    RAISE NOTICE '========================================';

END $$;

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Contar informes por tipo
SELECT 
    type,
    COUNT(*) as total,
    COUNT(CASE WHEN region_id IS NULL THEN 1 END) as nacionales,
    COUNT(CASE WHEN region_id IS NOT NULL THEN 1 END) as regionales
FROM reports
GROUP BY type
ORDER BY type;

-- Contar informes por visibilidad
SELECT 
    metadata->>'visibility' as visibility,
    COUNT(*) as total
FROM reports
WHERE metadata->>'visibility' IS NOT NULL
GROUP BY metadata->>'visibility';

-- Mostrar últimos 5 informes creados
SELECT 
    code,
    type,
    format,
    metadata->>'visibility' as visibility,
    metadata->>'category' as category,
    generated_at
FROM reports
ORDER BY generated_at DESC
LIMIT 5;
