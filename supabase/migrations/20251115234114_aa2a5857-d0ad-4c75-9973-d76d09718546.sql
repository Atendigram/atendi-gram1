-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function to setup new account with profile, welcome flow, and contacts table
CREATE OR REPLACE FUNCTION public.setup_new_account()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  slug text;
  table_name text;
  new_flow_uuid uuid;
  template_flow_id uuid := 'e48f633c-4c9e-407f-8979-18a8cc6fa81f';
BEGIN
  -- Generate slug from account name: lowercase, non-alphanumeric chars -> underscore
  slug := lower(regexp_replace(COALESCE(NEW.name, 'user'), '[^a-zA-Z0-9]+', '_', 'g'));
  table_name := 'contatos_' || slug;

  -- Create user-specific contacts table
  EXECUTE format(
    'CREATE TABLE IF NOT EXISTS public.%I (
       id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
       account_id uuid,
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

  -- Enable RLS on the new table
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);

  -- Create RLS policies for the new table
  EXECUTE format(
    'CREATE POLICY %I ON public.%I
     FOR ALL
     USING (account_id = current_account_id())',
    table_name || '_policy',
    table_name
  );

  -- Create welcome flow from template if no flows exist yet
  PERFORM 1 FROM public.welcome_flows WHERE account_id = NEW.id;
  IF NOT FOUND THEN
    INSERT INTO public.welcome_flows (id, workspace_id, name, enabled, is_default, updated_at, account_id)
    SELECT
      gen_random_uuid(),
      NEW.id,
      wf.name || ' (modelo)',
      wf.enabled,
      true,
      now(),
      NEW.id
    FROM public.welcome_flows wf
    WHERE wf.id = template_flow_id
    RETURNING id INTO new_flow_uuid;

    -- Copy welcome flow steps
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
      NEW.id
    FROM public.welcome_flow_steps s
    WHERE s.flow_id = template_flow_id
    ORDER BY s.order_index;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trg_setup_new_account ON public.accounts;

-- Create trigger on accounts table
CREATE TRIGGER trg_setup_new_account
AFTER INSERT ON public.accounts
FOR EACH ROW
EXECUTE FUNCTION public.setup_new_account();