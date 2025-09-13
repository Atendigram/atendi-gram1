-- Remove any existing triggers that might create welcome flows
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS create_default_welcome_flow_trigger ON accounts;

-- Ensure handle_new_user function only creates accounts
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  -- Only insert into accounts table, nothing else
  insert into public.accounts (id, owner_id, created_at)
  values (gen_random_uuid(), new.id, now());
  
  return new;
end;
$function$;

-- Recreate the trigger for handle_new_user to ensure it only creates accounts
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure create_default_welcome_flow does nothing
CREATE OR REPLACE FUNCTION public.create_default_welcome_flow()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  -- Explicitly do nothing - no welcome flows created during signup
  return new;
end;
$function$;