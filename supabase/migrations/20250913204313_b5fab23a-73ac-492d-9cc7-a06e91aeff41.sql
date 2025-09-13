-- Update handle_new_user function to use username from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_username text;
begin
  -- Extract username from user metadata, fallback to email if not provided
  v_username := coalesce(
    new.raw_user_meta_data->>'username',
    new.email
  );
  
  -- Insert into accounts table with username as name
  insert into public.accounts (id, owner_id, name, created_at)
  values (gen_random_uuid(), new.id, v_username, now());
  
  return new;
end;
$function$;