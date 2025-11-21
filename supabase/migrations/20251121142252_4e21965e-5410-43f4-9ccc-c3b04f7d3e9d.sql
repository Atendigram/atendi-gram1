-- Atualiza a função handle_new_user para usar 'name' do metadata ao criar a conta
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_username text;
  v_email text;
  v_account_id uuid;
  v_existing_profile uuid;
BEGIN
  -- Extract username and email from user metadata
  -- Agora usa 'name' ao invés de 'username'
  v_username := coalesce(
    new.raw_user_meta_data->>'name',
    new.email
  );
  v_email := new.email;
  
  -- Check if profile already exists by id (should be primary check)
  SELECT id INTO v_existing_profile
  FROM public.profiles
  WHERE id = new.id;
  
  IF v_existing_profile IS NOT NULL THEN
    -- Profile already exists, don't create a new one
    RAISE NOTICE 'Profile already exists for user %', new.id;
    RETURN new;
  END IF;
  
  -- Check if profile exists by email (if email is provided)
  IF v_email IS NOT NULL THEN
    SELECT id INTO v_existing_profile
    FROM public.profiles
    WHERE email = v_email;
    
    IF v_existing_profile IS NOT NULL THEN
      -- Profile with this email already exists
      RAISE NOTICE 'Profile with email % already exists', v_email;
      RETURN new;
    END IF;
  END IF;
  
  -- Check if an account already exists for this user
  SELECT id INTO v_account_id
  FROM public.accounts
  WHERE owner_id = new.id;
  
  -- If no account exists, create one using 'name' from metadata
  IF v_account_id IS NULL THEN
    INSERT INTO public.accounts (id, owner_id, name, created_at)
    VALUES (gen_random_uuid(), new.id, v_username, now())
    RETURNING id INTO v_account_id;
  END IF;
  
  -- Now safely insert the profile (constraints will prevent duplicates)
  INSERT INTO public.profiles (id, account_id, email, display_name, created_at)
  VALUES (new.id, v_account_id, v_email, v_username, now())
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$function$;