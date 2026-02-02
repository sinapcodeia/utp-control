-- Function to handle new user creation (Simplified & Safe)
CREATE OR REPLACE FUNCTION public.handle_new_user_simple()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    role,
    is_active,
    permissions,
    password_hash,
    accepted_terms,
    accepted_at
  )
  VALUES (
    new.id,
    new.email,
    'USER',
    true,
    '{}'::jsonb,
    '', -- Empty for social login, replaced by Supabase Auth
    COALESCE((new.raw_user_meta_data->>'accepted_terms')::boolean, false),
    (new.raw_user_meta_data->>'accepted_at')::timestamp with time zone
  )
  ON CONFLICT (id) DO UPDATE SET
    accepted_terms = EXCLUDED.accepted_terms,
    accepted_at = EXCLUDED.accepted_at;

  RETURN new;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error in handle_new_user_simple: %', SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger Definition
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_simple();
