-- Simplify handle_new_user function to only insert into accounts table
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  -- Only insert into accounts table
  insert into public.accounts (id, owner_id, created_at)
  values (gen_random_uuid(), new.id, now());

  return new;
end;
$function$;