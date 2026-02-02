-- Fetch IDs for Region and Municipality
-- These variables are for the INSERT statements below
-- Region: Amazonia (usually has IDs like REG-...)
-- Municipality: Leticia (usually has IDs like MUN-...)

DO $$
DECLARE
    v_user_id UUID := '69394a49-bdd1-4b4a-a163-1cd8ef72ee64';
    v_region_id TEXT;
    v_mun_id TEXT;
BEGIN
    SELECT id INTO v_region_id FROM regions LIMIT 1;
    SELECT id INTO v_mun_id FROM municipalities WHERE region_id = v_region_id LIMIT 1;

    IF v_region_id IS NOT NULL AND v_mun_id IS NOT NULL THEN
        -- Insert 3 visits for today
        INSERT INTO visits (id, full_name, address_text, status, priority, region_id, municipality_id, assigned_to, created_at, updated_at)
        VALUES 
            (gen_random_uuid()::text, 'UP San José', 'Vereda Central km 4', 'PENDING', 'MEDIUM', v_region_id, v_mun_id, v_user_id::text, NOW(), NOW()),
            (gen_random_uuid()::text, 'UP El Carmen', 'Sector Norte Brisas', 'PENDING', 'HIGH', v_region_id, v_mun_id, v_user_id::text, NOW(), NOW()),
            (gen_random_uuid()::text, 'UP Las Flores', 'Calle Principal 12-45', 'PENDING', 'LOW', v_region_id, v_mun_id, v_user_id::text, NOW(), NOW());
        
        RAISE NOTICE '3 Visits seeded for user %', v_user_id;
    ELSE
        RAISE NOTICE 'Could not find region or municipality to seed visits';
    END IF;
END $$;
