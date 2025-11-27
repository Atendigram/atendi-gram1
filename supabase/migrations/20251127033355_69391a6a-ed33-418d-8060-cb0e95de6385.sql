-- Add owner_id column to existing contatos tables that don't have it
DO $$
BEGIN
  -- Add owner_id to contatos_bella if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'contatos_bella' 
    AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE public.contatos_bella ADD COLUMN owner_id uuid;
  END IF;

  -- Add owner_id to contatos_geral if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'contatos_geral' 
    AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE public.contatos_geral ADD COLUMN owner_id uuid;
  END IF;

  -- Add owner_id to contatos_luna if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'contatos_luna' 
    AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE public.contatos_luna ADD COLUMN owner_id uuid;
  END IF;

  -- Add owner_id to contatos_etianefelixvip if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'contatos_etianefelixvip' 
    AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE public.contatos_etianefelixvip ADD COLUMN owner_id uuid;
  END IF;
END $$;

-- Create or replace the helper function to auto-fill owner_id
CREATE OR REPLACE FUNCTION public.fill_owner_id_from_account()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.owner_id IS NULL AND NEW.account_id IS NOT NULL THEN
    SELECT owner_id INTO NEW.owner_id
    FROM public.accounts
    WHERE id = NEW.account_id
    LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$;

-- Create triggers for existing tables
DROP TRIGGER IF EXISTS trg_fill_owner_id_contatos_bella ON public.contatos_bella;
CREATE TRIGGER trg_fill_owner_id_contatos_bella
BEFORE INSERT OR UPDATE ON public.contatos_bella
FOR EACH ROW
EXECUTE FUNCTION public.fill_owner_id_from_account();

DROP TRIGGER IF EXISTS trg_fill_owner_id_contatos_geral ON public.contatos_geral;
CREATE TRIGGER trg_fill_owner_id_contatos_geral
BEFORE INSERT OR UPDATE ON public.contatos_geral
FOR EACH ROW
EXECUTE FUNCTION public.fill_owner_id_from_account();

DROP TRIGGER IF EXISTS trg_fill_owner_id_contatos_luna ON public.contatos_luna;
CREATE TRIGGER trg_fill_owner_id_contatos_luna
BEFORE INSERT OR UPDATE ON public.contatos_luna
FOR EACH ROW
EXECUTE FUNCTION public.fill_owner_id_from_account();

DROP TRIGGER IF EXISTS trg_fill_owner_id_contatos_etianefelixvip ON public.contatos_etianefelixvip;
CREATE TRIGGER trg_fill_owner_id_contatos_etianefelixvip
BEFORE INSERT OR UPDATE ON public.contatos_etianefelixvip
FOR EACH ROW
EXECUTE FUNCTION public.fill_owner_id_from_account();

-- Update the setup_new_account function to include owner_id in new tables
CREATE OR REPLACE FUNCTION public.setup_new_account()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  slug text;
  table_name text;
  new_flow_uuid uuid;
  template_flow_id uuid := 'e48f633c-4c9e-407f-8979-18a8cc6fa81f';
BEGIN
  slug := lower(regexp_replace(COALESCE(NEW.name, 'user'), '[^a-zA-Z0-9]+', '_', 'g'));
  table_name := 'contatos_' || slug;

  -- Create the contacts table with owner_id included
  EXECUTE format(
    'CREATE TABLE IF NOT EXISTS public.%I (
       id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
       account_id uuid,
       owner_id uuid,
       chat_id bigint,
       user_id bigint,
       tg_id text,
       username text,
       first_name text,
       last_name text,
       name text,
       phone text,
       is_bot text,
       is_premium text,
       language_code text,
       source text,
       date_first_seen text,
       status text,
       fail_count integer DEFAULT 0,
       invalid_at timestamptz,
       invalid_reason text,
       welcome_opt_out boolean DEFAULT false,
       welcomed_at timestamptz,
       mensagem text,
       created_at timestamptz DEFAULT now()
     )',
    table_name
  );

  -- Enable RLS
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);

  -- Create RLS policy
  EXECUTE format(
    'CREATE POLICY %I ON public.%I
     FOR ALL
     USING (account_id = current_account_id())',
    table_name || '_policy',
    table_name
  );

  -- Create trigger to auto-fill owner_id
  EXECUTE format(
    'CREATE TRIGGER trg_fill_owner_id_%I
     BEFORE INSERT OR UPDATE ON public.%I
     FOR EACH ROW
     EXECUTE FUNCTION public.fill_owner_id_from_account()',
    table_name,
    table_name
  );

  -- Copy welcome flow template
  PERFORM 1 FROM public.welcome_flows WHERE account_id = NEW.id;
  IF NOT FOUND THEN
    INSERT INTO public.welcome_flows (id, workspace_id, name, enabled, is_default, updated_at, account_id)
    SELECT gen_random_uuid(), NEW.id, wf.name || ' (modelo)', wf.enabled, true, now(), NEW.id
    FROM public.welcome_flows wf
    WHERE wf.id = template_flow_id
    RETURNING id INTO new_flow_uuid;

    INSERT INTO public.welcome_flow_steps
      (id, flow_id, order_index, kind, text_content, parse_mode, media_url, media_path, delay_after_sec, created_at, account_id)
    SELECT gen_random_uuid(), new_flow_uuid, s.order_index, s.kind, s.text_content, s.parse_mode, s.media_url, s.media_path, s.delay_after_sec, now(), NEW.id
    FROM public.welcome_flow_steps s
    WHERE s.flow_id = template_flow_id
    ORDER BY s.order_index;
  END IF;

  RETURN NEW;
END;
$function$;