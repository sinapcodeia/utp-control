
-- CRYPT EXTENSION (Necesaria para gen_salt)
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- FUNCIÓN DE HASHING (Simulada para desarrollo, Supabase usa bcrypt interno)
-- NOTA: Esto inserta un hash bcrypt válido para 'UTPControl2026!'
-- Hash: $2a$10$6jX... (Generado previamente o usando pgcrypto)

DO $$ 
DECLARE 
    admin_id uuid := gen_random_uuid();
    coord_id uuid := gen_random_uuid();
    gestor_id uuid := gen_random_uuid();
    -- Password: UTPControl2026! (Bcrypt standard)
    crypted_pw text := crypt('UTPControl2026!', gen_salt('bf'));
BEGIN

    -- 1. ADMIN USER
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@test.com') THEN
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000', admin_id, 'authenticated', 'authenticated', 'admin@test.com', crypted_pw, now(),
            '{"provider":"email","providers":["email"]}', '{"full_name": "Admin Sistema", "dni": "DNI-ADM-001"}', now(), now(), ''
        );
        
        INSERT INTO auth.identities (
            id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
        ) VALUES (
            admin_id, admin_id, format('{"sub":"%s","email":"admin@test.com"}', admin_id)::jsonb, 'email', now(), now(), now()
        );
    END IF;

    -- 2. COORDINATOR USER
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'coord@test.com') THEN
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000', coord_id, 'authenticated', 'authenticated', 'coord@test.com', crypted_pw, now(),
            '{"provider":"email","providers":["email"]}', '{"full_name": "Coordinador Nariño", "dni": "DNI-COO-001"}', now(), now(), ''
        );

        INSERT INTO auth.identities (
            id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
        ) VALUES (
            coord_id, coord_id, format('{"sub":"%s","email":"coord@test.com"}', coord_id)::jsonb, 'email', now(), now(), now()
        );
    END IF;

    -- 3. GESTOR USER
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'gestor@test.com') THEN
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000', gestor_id, 'authenticated', 'authenticated', 'gestor@test.com', crypted_pw, now(),
            '{"provider":"email","providers":["email"]}', '{"full_name": "Gestor Operativo", "dni": "DNI-GES-001"}', now(), now(), ''
        );

        INSERT INTO auth.identities (
            id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
        ) VALUES (
            gestor_id, gestor_id, format('{"sub":"%s","email":"gestor@test.com"}', gestor_id)::jsonb, 'email', now(), now(), now()
        );
    END IF;

END $$;

SELECT 'Usuarios de Auth creados/verificados correctamente' as status;
