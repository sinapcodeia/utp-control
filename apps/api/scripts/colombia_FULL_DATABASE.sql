-- SCRIPT DE CARGA MASIVA: TODOS LOS DEPARTAMENTOS Y MUNICIPIOS PRINCIPALES DE COLOMBIA
-- UTP CONTROL - SISTEMA TERRITORIAL COMPLETO

DO $$ 
DECLARE
    -- IDs Estatales Determinísticos (Cántidad: 32 Departamentos + Bogotá)
    ant_id TEXT := '00000000-0000-4000-a000-000000000005';
    atl_id TEXT := '00000000-0000-4000-a000-000000000008';
    bog_id TEXT := '00000000-0000-4000-a000-000000000011';
    bol_id TEXT := '00000000-0000-4000-a000-000000000013';
    boy_id TEXT := '00000000-0000-4000-a000-000000000015';
    cal_id TEXT := '00000000-0000-4000-a000-000000000017';
    caq_id TEXT := '00000000-0000-4000-a000-000000000018';
    cau_id TEXT := '00000000-0000-4000-a000-000000000019';
    ces_id TEXT := '00000000-0000-4000-a000-000000000020';
    cor_id TEXT := '00000000-0000-4000-a000-000000000023';
    cun_id TEXT := '00000000-0000-4000-a000-000000000025';
    cho_id TEXT := '00000000-0000-4000-a000-000000000027';
    hui_id TEXT := '00000000-0000-4000-a000-000000000041';
    lag_id TEXT := '00000000-0000-4000-a000-000000000044';
    mag_id TEXT := '00000000-0000-4000-a000-000000000047';
    met_id TEXT := '00000000-0000-4000-a000-000000000050';
    nar_id TEXT := '00000000-0000-4000-a000-000000000052';
    nsa_id TEXT := '00000000-0000-4000-a000-000000000054';
    qui_id TEXT := '00000000-0000-4000-a000-000000000063';
    ris_id TEXT := '00000000-0000-4000-a000-000000000066';
    san_id TEXT := '00000000-0000-4000-a000-000000000068';
    suc_id TEXT := '00000000-0000-4000-a000-000000000070';
    tol_id TEXT := '00000000-0000-4000-a000-000000000073';
    val_id TEXT := '00000000-0000-4000-a000-000000000076';
    ara_id TEXT := '00000000-0000-4000-a000-000000000081';
    cas_id TEXT := '00000000-0000-4000-a000-000000000085';
    put_id TEXT := '00000000-0000-4000-a000-000000000086';
    sap_id TEXT := '00000000-0000-4000-a000-000000000088';
    ama_id TEXT := '00000000-0000-4000-a000-000000000091';
    gua_id TEXT := '00000000-0000-4000-a000-000000000094';
    guv_id TEXT := '00000000-0000-4000-a000-000000000095';
    vau_id TEXT := '00000000-0000-4000-a000-000000000097';
    vic_id TEXT := '00000000-0000-4000-a000-000000000099';

BEGIN
    -- 1. CARGA DE DEPARTAMENTOS (Garantiza los 32)
    INSERT INTO regions (id, name, code) VALUES
    (ant_id, 'Antioquia', 'ANT'), (atl_id, 'Atlántico', 'ATL'), (bog_id, 'Bogotá D.C.', 'BOG'), (bol_id, 'Bolívar', 'BOL'),
    (boy_id, 'Boyacá', 'BOY'), (cal_id, 'Caldas', 'CAL'), (caq_id, 'Caquetá', 'CAQ'), (cau_id, 'Cauca', 'CAU'),
    (ces_id, 'Cesar', 'CES'), (cor_id, 'Córdoba', 'COR'), (cun_id, 'Cundinamarca', 'CUN'), (cho_id, 'Chocó', 'CHO'),
    (hui_id, 'Huila', 'HUI'), (lag_id, 'La Guajira', 'LAG'), (mag_id, 'Magdalena', 'MAG'), (met_id, 'Meta', 'MET'),
    (nar_id, 'Nariño', 'NAR'), (nsa_id, 'Norte de Santander', 'NSA'), (qui_id, 'Quindío', 'QUI'), (ris_id, 'Risaralda', 'RIS'),
    (san_id, 'Santander', 'SAN'), (suc_id, 'Sucre', 'SUC'), (tol_id, 'Tolima', 'TOL'), (val_id, 'Valle del Cauca', 'VAC'),
    (ara_id, 'Arauca', 'ARA'), (cas_id, 'Casanare', 'CAS'), (put_id, 'Putumayo', 'PUT'), (sap_id, 'San Andrés', 'SAP'),
    (ama_id, 'Amazonas', 'AMA'), (gua_id, 'Guainía', 'GUA'), (guv_id, 'Guaviare', 'GUV'), (vau_id, 'Vaupés', 'VAU'), (vic_id, 'Vichada', 'VIC')
    ON CONFLICT (name) DO NOTHING;

    -- 2. CARGA MASIVA DE MUNICIPIOS (Agrupados por Departamento)
    
    -- ANTIOQUIA
    INSERT INTO municipalities (id, name, region_id) VALUES
    (gen_random_uuid()::text, 'Medellín', ant_id), (gen_random_uuid()::text, 'Apartadó', ant_id), (gen_random_uuid()::text, 'Bello', ant_id),
    (gen_random_uuid()::text, 'Caucasia', ant_id), (gen_random_uuid()::text, 'Envigado', ant_id), (gen_random_uuid()::text, 'Itagüí', ant_id),
    (gen_random_uuid()::text, 'Rionegro', ant_id), (gen_random_uuid()::text, 'Turbo', ant_id), (gen_random_uuid()::text, 'Yarumal', ant_id)
    ON CONFLICT (region_id, name) DO NOTHING;

    -- ATLANTICO
    INSERT INTO municipalities (id, name, region_id) VALUES
    (gen_random_uuid()::text, 'Barranquilla', atl_id), (gen_random_uuid()::text, 'Soledad', atl_id), (gen_random_uuid()::text, 'Malambo', atl_id),
    (gen_random_uuid()::text, 'Sabanalarga', atl_id), (gen_random_uuid()::text, 'Puerto Colombia', atl_id)
    ON CONFLICT (region_id, name) DO NOTHING;

    -- BOLIVAR
    INSERT INTO municipalities (id, name, region_id) VALUES
    (gen_random_uuid()::text, 'Cartagena', bol_id), (gen_random_uuid()::text, 'Magangué', bol_id), (gen_random_uuid()::text, 'Turbaco', bol_id),
    (gen_random_uuid()::text, 'Arjona', bol_id), (gen_random_uuid()::text, 'El Carmen de Bolívar', bol_id)
    ON CONFLICT (region_id, name) DO NOTHING;

    -- BOYACA
    INSERT INTO municipalities (id, name, region_id) VALUES
    (gen_random_uuid()::text, 'Tunja', boy_id), (gen_random_uuid()::text, 'Duitama', boy_id), (gen_random_uuid()::text, 'Sogamoso', boy_id),
    (gen_random_uuid()::text, 'Chiquinquirá', boy_id), (gen_random_uuid()::text, 'Paipa', boy_id)
    ON CONFLICT (region_id, name) DO NOTHING;

    -- CALDAS
    INSERT INTO municipalities (id, name, region_id) VALUES
    (gen_random_uuid()::text, 'Manizales', cal_id), (gen_random_uuid()::text, 'La Dorada', cal_id), (gen_random_uuid()::text, 'Chinchiná', cal_id)
    ON CONFLICT (region_id, name) DO NOTHING;

    -- CAUCA
    INSERT INTO municipalities (id, name, region_id) VALUES
    (gen_random_uuid()::text, 'Popayán', cau_id), (gen_random_uuid()::text, 'Santander de Quilichao', cau_id), (gen_random_uuid()::text, 'Puerto Tejada', cau_id)
    ON CONFLICT (region_id, name) DO NOTHING;

    -- CESAR
    INSERT INTO municipalities (id, name, region_id) VALUES
    (gen_random_uuid()::text, 'Valledupar', ces_id), (gen_random_uuid()::text, 'Aguachica', ces_id), (gen_random_uuid()::text, 'Agustín Codazzi', ces_id)
    ON CONFLICT (region_id, name) DO NOTHING;

    -- CORDOBA
    INSERT INTO municipalities (id, name, region_id) VALUES
    (gen_random_uuid()::text, 'Montería', cor_id), (gen_random_uuid()::text, 'Cereté', cor_id), (gen_random_uuid()::text, 'Sahagún', cor_id), (gen_random_uuid()::text, 'Lorica', cor_id)
    ON CONFLICT (region_id, name) DO NOTHING;

    -- CUNDINAMARCA
    INSERT INTO municipalities (id, name, region_id) VALUES
    (gen_random_uuid()::text, 'Soacha', cun_id), (gen_random_uuid()::text, 'Girardot', cun_id), (gen_random_uuid()::text, 'Fusagasugá', cun_id),
    (gen_random_uuid()::text, 'Facatativá', cun_id), (gen_random_uuid()::text, 'Chía', cun_id), (gen_random_uuid()::text, 'Zipaquirá', cun_id)
    ON CONFLICT (region_id, name) DO NOTHING;

    -- HUILA
    INSERT INTO municipalities (id, name, region_id) VALUES
    (gen_random_uuid()::text, 'Neiva', hui_id), (gen_random_uuid()::text, 'Pitalito', hui_id), (gen_random_uuid()::text, 'Garzón', hui_id)
    ON CONFLICT (region_id, name) DO NOTHING;

    -- MAGDALENA
    INSERT INTO municipalities (id, name, region_id) VALUES
    (gen_random_uuid()::text, 'Santa Marta', mag_id), (gen_random_uuid()::text, 'Ciénaga', mag_id), (gen_random_uuid()::text, 'Fundación', mag_id)
    ON CONFLICT (region_id, name) DO NOTHING;

    -- META
    INSERT INTO municipalities (id, name, region_id) VALUES
    (gen_random_uuid()::text, 'Villavicencio', met_id), (gen_random_uuid()::text, 'Acacías', met_id), (gen_random_uuid()::text, 'Granada', met_id)
    ON CONFLICT (region_id, name) DO NOTHING;

    -- NARIÑO
    INSERT INTO municipalities (id, name, region_id) VALUES
    (gen_random_uuid()::text, 'Pasto', nar_id), (gen_random_uuid()::text, 'Ipiales', nar_id), (gen_random_uuid()::text, 'Tumaco', nar_id)
    ON CONFLICT (region_id, name) DO NOTHING;

    -- NORTE DE SANTANDER
    INSERT INTO municipalities (id, name, region_id) VALUES
    (gen_random_uuid()::text, 'Cúcuta', nsa_id), (gen_random_uuid()::text, 'Ocaña', nsa_id), (gen_random_uuid()::text, 'Villa del Rosario', nsa_id), (gen_random_uuid()::text, 'Pamplona', nsa_id)
    ON CONFLICT (region_id, name) DO NOTHING;

    -- QUINDIO
    INSERT INTO municipalities (id, name, region_id) VALUES
    (gen_random_uuid()::text, 'Armenia', qui_id), (gen_random_uuid()::text, 'Calarcá', qui_id), (gen_random_uuid()::text, 'Quimbaya', qui_id)
    ON CONFLICT (region_id, name) DO NOTHING;

    -- RISARALDA
    INSERT INTO municipalities (id, name, region_id) VALUES
    (gen_random_uuid()::text, 'Pereira', ris_id), (gen_random_uuid()::text, 'Dosquebradas', ris_id), (gen_random_uuid()::text, 'Santa Rosa de Cabal', ris_id)
    ON CONFLICT (region_id, name) DO NOTHING;

    -- SANTANDER
    INSERT INTO municipalities (id, name, region_id) VALUES
    (gen_random_uuid()::text, 'Bucaramanga', san_id), (gen_random_uuid()::text, 'Floridablanca', san_id), (gen_random_uuid()::text, 'Girón', san_id),
    (gen_random_uuid()::text, 'Piedecuesta', san_id), (gen_random_uuid()::text, 'Barrancabermeja', san_id)
    ON CONFLICT (region_id, name) DO NOTHING;

    -- SUCRE
    INSERT INTO municipalities (id, name, region_id) VALUES
    (gen_random_uuid()::text, 'Sincelejo', suc_id), (gen_random_uuid()::text, 'Corozal', suc_id)
    ON CONFLICT (region_id, name) DO NOTHING;

    -- TOLIMA
    INSERT INTO municipalities (id, name, region_id) VALUES
    (gen_random_uuid()::text, 'Ibagué', tol_id), (gen_random_uuid()::text, 'Espinal', tol_id), (gen_random_uuid()::text, 'Mariquita', tol_id)
    ON CONFLICT (region_id, name) DO NOTHING;

    -- VALLE DEL CAUCA
    INSERT INTO municipalities (id, name, region_id) VALUES
    (gen_random_uuid()::text, 'Cali', val_id), (gen_random_uuid()::text, 'Buenaventura', val_id), (gen_random_uuid()::text, 'Palmira', val_id),
    (gen_random_uuid()::text, 'Tuluá', val_id), (gen_random_uuid()::text, 'Cartago', val_id), (gen_random_uuid()::text, 'Jamundí', val_id), (gen_random_uuid()::text, 'Buga', val_id)
    ON CONFLICT (region_id, name) DO NOTHING;

    -- OTROS (Capitales de departamentos restantes)
    INSERT INTO municipalities (id, name, region_id) VALUES
    (gen_random_uuid()::text, 'Quibdó', cho_id), (gen_random_uuid()::text, 'Riohacha', lag_id), (gen_random_uuid()::text, 'Arauca', ara_id),
    (gen_random_uuid()::text, 'Yopal', cas_id), (gen_random_uuid()::text, 'Mocoa', put_id), (gen_random_uuid()::text, 'San Andrés', sap_id),
    (gen_random_uuid()::text, 'Leticia', ama_id), (gen_random_uuid()::text, 'Puerto Inírida', gua_id), (gen_random_uuid()::text, 'San José del Guaviare', guv_id),
    (gen_random_uuid()::text, 'Mitú', vau_id), (gen_random_uuid()::text, 'Puerto Carreño', vic_id), (gen_random_uuid()::text, 'Florencia', caq_id)
    ON CONFLICT (region_id, name) DO NOTHING;

END $$;
