-- Disable welcome flow creation during signup by making the trigger function a no-op
CREATE OR REPLACE FUNCTION public.create_default_welcome_flow()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  -- Intentionally do nothing to avoid inserting into welcome_flows during signup
  return new;
end;
$function$;

-- Keep handle_new_user minimal (only accounts insert already applied earlier)
-- No changes here, just ensuring it's present as minimal
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