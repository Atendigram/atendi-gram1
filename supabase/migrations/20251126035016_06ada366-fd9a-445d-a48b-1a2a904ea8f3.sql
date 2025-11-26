-- Enable RLS on active contact tables that are missing it
-- Fixes: SUPA_rls_disabled_in_public error

-- Enable RLS on contatos_bella
ALTER TABLE public.contatos_bella ENABLE ROW LEVEL SECURITY;

-- Enable RLS on contatos_geral
ALTER TABLE public.contatos_geral ENABLE ROW LEVEL SECURITY;

-- Enable RLS on contatos_luna
ALTER TABLE public.contatos_luna ENABLE ROW LEVEL SECURITY;

-- Create account-scoped policies for contatos_bella
CREATE POLICY "contatos_bella_policy" ON public.contatos_bella
FOR ALL 
USING (account_id = current_account_id());

-- Create account-scoped policies for contatos_geral
CREATE POLICY "contatos_geral_policy" ON public.contatos_geral
FOR ALL 
USING (account_id = current_account_id());

-- Create account-scoped policies for contatos_luna
CREATE POLICY "contatos_luna_policy" ON public.contatos_luna
FOR ALL 
USING (account_id = current_account_id());