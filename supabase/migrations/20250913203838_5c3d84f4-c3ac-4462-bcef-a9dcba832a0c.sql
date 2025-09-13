-- Update handle_new_user function to set account name to user's email
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  -- Insert into accounts table with name set to user's email
  insert into public.accounts (id, owner_id, name, created_at)
  values (gen_random_uuid(), new.id, new.email, now());
  
  return new;
end;
$function$;