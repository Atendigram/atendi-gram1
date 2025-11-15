-- Function to get the contacts table name for an account
CREATE OR REPLACE FUNCTION public.get_contacts_table_name(p_account_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  account_name text;
  slug text;
  table_name text;
BEGIN
  -- Check for specific account mappings
  IF p_account_id = '5777f0ad-719d-4d92-b23b-aefa9d7077ac' THEN
    RETURN 'contatos_luna';
  END IF;
  
  IF p_account_id = '0727f119-2e77-42f5-ab9c-7a5f3aacedc0' THEN
    RETURN 'contatos_bella';
  END IF;
  
  -- For other accounts, get the slug from account name
  SELECT name INTO account_name
  FROM accounts
  WHERE id = p_account_id;
  
  IF account_name IS NULL THEN
    RETURN 'contatos_geral'; -- fallback
  END IF;
  
  -- Generate slug
  slug := lower(regexp_replace(account_name, '[^a-zA-Z0-9]+', '_', 'g'));
  table_name := 'contatos_' || slug;
  
  -- Check if table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = table_name
  ) THEN
    RETURN table_name;
  ELSE
    RETURN 'contatos_geral'; -- fallback if table doesn't exist
  END IF;
END;
$$;

-- Updated dashboard metrics function to use dynamic tables
CREATE OR REPLACE FUNCTION public.get_dashboard_metrics()
RETURNS TABLE(total_contacts bigint, contacts_today bigint, messages_month bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_account_id uuid;
  contacts_table text;
  total_count bigint;
  today_count bigint;
BEGIN
  -- Get user's account_id
  SELECT account_id INTO user_account_id
  FROM public.profiles
  WHERE id = auth.uid();
  
  IF user_account_id IS NULL THEN
    RETURN QUERY SELECT 0::bigint, 0::bigint, 0::bigint;
    RETURN;
  END IF;
  
  -- Get the contacts table name for this account
  contacts_table := get_contacts_table_name(user_account_id);
  
  -- Get total contacts count
  EXECUTE format(
    'SELECT COUNT(*) FROM public.%I WHERE account_id = $1',
    contacts_table
  ) USING user_account_id INTO total_count;
  
  -- Get today's contacts count
  EXECUTE format(
    'SELECT COUNT(*) FROM public.%I WHERE account_id = $1 AND created_at::date = CURRENT_DATE',
    contacts_table
  ) USING user_account_id INTO today_count;
  
  -- Get messages count for the month (from disparo_items)
  RETURN QUERY
  SELECT
    COALESCE(total_count, 0) AS total_contacts,
    COALESCE(today_count, 0) AS contacts_today,
    COALESCE(
      (SELECT COUNT(*)
       FROM disparo_items di
       WHERE di.account_id = user_account_id
         AND di.status = 'sent'
         AND date_trunc('month', di.created_at) = date_trunc('month', CURRENT_DATE)
      ), 0
    ) AS messages_month;
END;
$$;