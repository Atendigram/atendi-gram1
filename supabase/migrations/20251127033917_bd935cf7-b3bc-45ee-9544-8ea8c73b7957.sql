-- Fix the ambiguous column reference in get_contacts_table_name function
CREATE OR REPLACE FUNCTION public.get_contacts_table_name(p_account_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  account_name text;
  slug text;
  contacts_table text;
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
  contacts_table := 'contatos_' || slug;
  
  -- Check if table exists (FIX: qualify column name to avoid ambiguity)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND information_schema.tables.table_name = contacts_table
  ) THEN
    RETURN contacts_table;
  ELSE
    RETURN 'contatos_geral'; -- fallback if table doesn't exist
  END IF;
END;
$function$;