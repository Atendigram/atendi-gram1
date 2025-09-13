-- Fix remaining function security issues by setting proper search paths

CREATE OR REPLACE FUNCTION public.claim_disparo_items(p_campaign uuid, p_limit integer DEFAULT 20)
 RETURNS TABLE(id uuid, tg_id bigint, payload jsonb, msg_type text, text text, media_url text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  return query
  update disparo_items di
  set status = 'sending'
  where di.id in (
    select id
    from disparo_items
    where campaign_id = p_campaign
      and status = 'queued'
    order by scheduled_at asc
    limit p_limit
    for update skip locked
  )
  returning
    di.id,
    di.tg_id,
    coalesce(di.payload, '{}'::jsonb) as payload,
    coalesce(di.payload->>'type', 'text') as msg_type,
    coalesce(di.payload->>'text', di.payload->>'message') as text,
    di.payload->>'media_url' as media_url;
end;
$function$;

CREATE OR REPLACE FUNCTION public.create_default_welcome_flow()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  -- Explicitly do nothing - no welcome flows created during signup
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.enforce_single_default_flow()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Quando alguém marca esse flow como is_default = true
  IF NEW.is_default = true THEN
    -- Desativa todos os outros flows dessa mesma conta
    UPDATE welcome_flows
    SET is_default = false
    WHERE account_id = NEW.account_id
      AND id <> NEW.id;
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_timestamp_telegram_sessions()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
    begin
      new.updated_at = now();
      return new;
    end;
    $function$;