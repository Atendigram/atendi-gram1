-- Fix signup error: remove triggers that reference non-existent owner_id field

-- Drop any trigger that might be using insert_default_welcome_on_profile on profiles table
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
DROP TRIGGER IF EXISTS insert_welcome_on_profile ON public.profiles;

-- Drop the problematic function that tries to access new.owner_id on profiles
DROP FUNCTION IF EXISTS public.insert_default_welcome_on_profile() CASCADE;

-- Ensure handle_new_user trigger exists and is correct
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Ensure copy_welcome_template_to_new_account trigger exists on accounts table
DROP TRIGGER IF EXISTS after_account_insert ON public.accounts;

CREATE TRIGGER after_account_insert
  AFTER INSERT ON public.accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.copy_welcome_template_to_new_account();