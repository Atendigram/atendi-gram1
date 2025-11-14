-- Update template flow ID for new user registrations
-- Change from "Boas-vindas Étiane (modelo)" to "Boas-vindas Genérico"

CREATE OR REPLACE FUNCTION public.copy_welcome_template_to_new_account()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  template_flow_id uuid := 'e48f633c-4c9e-407f-8979-18a8cc6fa81f'; -- Changed to "Boas-vindas Genérico"
  new_flow_uuid uuid;
BEGIN
  -- 2.1 - Se já houver qualquer fluxo para essa conta, não faz nada (evita duplicação)
  PERFORM 1 FROM public.welcome_flows WHERE account_id = NEW.id;
  IF FOUND THEN
    RETURN NEW;
  END IF;

  -- 2.2 - Insere novo fluxo baseado no template (workspace_id = NEW.id)
  INSERT INTO public.welcome_flows (id, workspace_id, name, enabled, is_default, updated_at, account_id)
  SELECT
    gen_random_uuid(),
    NEW.id,                        -- workspace_id para novo fluxo = id da conta criada
    wf.name || ' (modelo)',
    wf.enabled,
    FALSE,                          -- não marcar como default global
    now(),
    NEW.id
  FROM public.welcome_flows wf
  WHERE wf.id = template_flow_id
  RETURNING id INTO new_flow_uuid;

  -- 2.3 - Copia os steps associando-os ao novo fluxo e preenchendo account_id
  INSERT INTO public.welcome_flow_steps
    (id, flow_id, order_index, kind, text_content, parse_mode, media_url, media_path, delay_after_sec, created_at, account_id)
  SELECT
    gen_random_uuid(),
    new_flow_uuid,
    s.order_index,
    s.kind,
    s.text_content,
    s.parse_mode,
    s.media_url,
    s.media_path,
    s.delay_after_sec,
    now(),
    NEW.id                           -- <<-- garante account_id preenchido nos steps
  FROM public.welcome_flow_steps s
  WHERE s.flow_id = template_flow_id
  ORDER BY s.order_index;

  RETURN NEW;
END;
$function$;