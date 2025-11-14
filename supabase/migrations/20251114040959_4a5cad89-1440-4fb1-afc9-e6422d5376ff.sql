-- Clean up duplicate profiles before adding constraints
-- This migration removes duplicate profiles, keeping only the one where id = owner_id

DO $$
DECLARE
  v_account_id uuid;
  v_correct_profile_id uuid;
  v_duplicate_profile_id uuid;
BEGIN
  -- For account 753843f6-d017-4c7e-a7a0-e81c323d0a30, keep the profile where id matches the account owner
  v_account_id := '753843f6-d017-4c7e-a7a0-e81c323d0a30';
  
  -- Get the owner_id from accounts table
  SELECT owner_id INTO v_correct_profile_id
  FROM accounts
  WHERE id = v_account_id;
  
  -- Delete any profiles for this account that don't match the owner_id
  DELETE FROM profiles
  WHERE account_id = v_account_id
    AND id != v_correct_profile_id;
    
  RAISE NOTICE 'Cleaned up duplicate profiles for account %', v_account_id;
END $$;

-- Now add unique constraints on profiles table
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_key 
ON public.profiles (email) 
WHERE email IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_account_id_key 
ON public.profiles (account_id);

-- Update the handle_new_user function to be idempotent and prevent duplicates
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_username text;
  v_email text;
  v_account_id uuid;
  v_existing_profile uuid;
BEGIN
  -- Extract username and email from user metadata
  v_username := coalesce(
    new.raw_user_meta_data->>'username',
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
  
  -- If no account exists, create one
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
$$;

-- Create a helper function to safely get or create a profile
CREATE OR REPLACE FUNCTION public.get_or_create_profile(_user_id uuid, _email text, _display_name text DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id uuid;
  v_account_id uuid;
BEGIN
  -- First check by user_id
  SELECT id INTO v_profile_id
  FROM public.profiles
  WHERE id = _user_id;
  
  IF v_profile_id IS NOT NULL THEN
    RETURN v_profile_id;
  END IF;
  
  -- Check by email if provided
  IF _email IS NOT NULL THEN
    SELECT id INTO v_profile_id
    FROM public.profiles
    WHERE email = _email;
    
    IF v_profile_id IS NOT NULL THEN
      RETURN v_profile_id;
    END IF;
  END IF;
  
  -- Get or create account
  SELECT id INTO v_account_id
  FROM public.accounts
  WHERE owner_id = _user_id;
  
  IF v_account_id IS NULL THEN
    INSERT INTO public.accounts (id, owner_id, name, created_at)
    VALUES (gen_random_uuid(), _user_id, coalesce(_display_name, _email), now())
    RETURNING id INTO v_account_id;
  END IF;
  
  -- Create profile if it doesn't exist (constraints will prevent duplicates)
  INSERT INTO public.profiles (id, account_id, email, display_name, created_at)
  VALUES (_user_id, v_account_id, _email, _display_name, now())
  ON CONFLICT (id) DO NOTHING
  RETURNING id INTO v_profile_id;
  
  -- If conflict occurred, get the existing profile
  IF v_profile_id IS NULL THEN
    SELECT id INTO v_profile_id
    FROM public.profiles
    WHERE id = _user_id OR email = _email
    LIMIT 1;
  END IF;
  
  RETURN v_profile_id;
END;
$$;