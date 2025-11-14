-- ============================================================================
-- Create helper function to get current user's account_id from profile
-- ============================================================================

CREATE OR REPLACE FUNCTION public.current_account_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT account_id
  FROM public.profiles
  WHERE id = auth.uid();
$$;

-- ============================================================================
-- Update contatos_geral policies to handle account_id and owner_id
-- ============================================================================

ALTER TABLE public.contatos_geral ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contatos_geral_by_account_select" ON public.contatos_geral;
DROP POLICY IF EXISTS "Members can view account contatos_luna" ON public.contatos_geral;
DROP POLICY IF EXISTS "Members can insert account contatos_luna" ON public.contatos_geral;
DROP POLICY IF EXISTS "Members can update account contatos_luna" ON public.contatos_geral;
DROP POLICY IF EXISTS "Members can delete account contatos_luna" ON public.contatos_geral;

CREATE POLICY "contatos_geral_by_profile_account_select"
  ON public.contatos_geral
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND account_id = public.current_account_id()
  );

CREATE POLICY "contatos_geral_insert_policy"
  ON public.contatos_geral
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND account_id = public.current_account_id()
  );

CREATE POLICY "contatos_geral_update_policy"
  ON public.contatos_geral
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND account_id = public.current_account_id()
  );

CREATE POLICY "contatos_geral_delete_policy"
  ON public.contatos_geral
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL
    AND account_id = public.current_account_id()
  );

-- ============================================================================
-- Update disparos policies to handle account_id and owner_id
-- ============================================================================

DROP POLICY IF EXISTS "select own disparos" ON public.disparos;
DROP POLICY IF EXISTS "insert own disparos" ON public.disparos;
DROP POLICY IF EXISTS "update own disparos" ON public.disparos;
DROP POLICY IF EXISTS "delete own disparos" ON public.disparos;
DROP POLICY IF EXISTS "Members can view account disparos" ON public.disparos;
DROP POLICY IF EXISTS "Members can insert account disparos" ON public.disparos;
DROP POLICY IF EXISTS "Members can update account disparos" ON public.disparos;
DROP POLICY IF EXISTS "Members can delete account disparos" ON public.disparos;

CREATE POLICY "disparos_select_policy"
  ON public.disparos
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND account_id = public.current_account_id()
  );

CREATE POLICY "disparos_insert_policy"
  ON public.disparos
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND account_id = public.current_account_id()
  );

CREATE POLICY "disparos_update_policy"
  ON public.disparos
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND account_id = public.current_account_id()
  );

CREATE POLICY "disparos_delete_policy"
  ON public.disparos
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL
    AND account_id = public.current_account_id()
  );

-- ============================================================================
-- Update disparo_items policies to handle account_id and owner_id
-- ============================================================================

DROP POLICY IF EXISTS "select items of my account" ON public.disparo_items;
DROP POLICY IF EXISTS "insert items of my account" ON public.disparo_items;
DROP POLICY IF EXISTS "update items of my account" ON public.disparo_items;
DROP POLICY IF EXISTS "delete items of my account" ON public.disparo_items;
DROP POLICY IF EXISTS "Members can view account disparo_items" ON public.disparo_items;
DROP POLICY IF EXISTS "Members can insert account disparo_items" ON public.disparo_items;
DROP POLICY IF EXISTS "Members can update account disparo_items" ON public.disparo_items;
DROP POLICY IF EXISTS "Members can delete account disparo_items" ON public.disparo_items;

CREATE POLICY "disparo_items_select_policy"
  ON public.disparo_items
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND account_id = public.current_account_id()
  );

CREATE POLICY "disparo_items_insert_policy"
  ON public.disparo_items
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND account_id = public.current_account_id()
  );

CREATE POLICY "disparo_items_update_policy"
  ON public.disparo_items
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND account_id = public.current_account_id()
  );

CREATE POLICY "disparo_items_delete_policy"
  ON public.disparo_items
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL
    AND account_id = public.current_account_id()
  );

-- ============================================================================
-- Update welcome_flows policies to handle account_id and owner_id
-- ============================================================================

DROP POLICY IF EXISTS "Members can view account welcome_flows" ON public.welcome_flows;
DROP POLICY IF EXISTS "Members can insert account welcome_flows" ON public.welcome_flows;
DROP POLICY IF EXISTS "Members can update account welcome_flows" ON public.welcome_flows;
DROP POLICY IF EXISTS "Members can delete account welcome_flows" ON public.welcome_flows;

CREATE POLICY "welcome_flows_select_policy"
  ON public.welcome_flows
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND account_id = public.current_account_id()
  );

CREATE POLICY "welcome_flows_insert_policy"
  ON public.welcome_flows
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND account_id = public.current_account_id()
  );

CREATE POLICY "welcome_flows_update_policy"
  ON public.welcome_flows
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND account_id = public.current_account_id()
  );

CREATE POLICY "welcome_flows_delete_policy"
  ON public.welcome_flows
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL
    AND account_id = public.current_account_id()
  );

-- ============================================================================
-- Update welcome_flow_steps policies to handle account_id and owner_id
-- ============================================================================

DROP POLICY IF EXISTS "Members can view account welcome_flow_steps" ON public.welcome_flow_steps;
DROP POLICY IF EXISTS "Members can insert account welcome_flow_steps" ON public.welcome_flow_steps;
DROP POLICY IF EXISTS "Members can update account welcome_flow_steps" ON public.welcome_flow_steps;
DROP POLICY IF EXISTS "Members can delete account welcome_flow_steps" ON public.welcome_flow_steps;

CREATE POLICY "welcome_flow_steps_select_policy"
  ON public.welcome_flow_steps
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND account_id = public.current_account_id()
  );

CREATE POLICY "welcome_flow_steps_insert_policy"
  ON public.welcome_flow_steps
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND account_id = public.current_account_id()
  );

CREATE POLICY "welcome_flow_steps_update_policy"
  ON public.welcome_flow_steps
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND account_id = public.current_account_id()
  );

CREATE POLICY "welcome_flow_steps_delete_policy"
  ON public.welcome_flow_steps
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL
    AND account_id = public.current_account_id()
  );

-- ============================================================================
-- Update boas_vindas_settings policies to handle account_id and owner_id
-- ============================================================================

DROP POLICY IF EXISTS "Members can view account boas_vindas_settings" ON public.boas_vindas_settings;
DROP POLICY IF EXISTS "Members can insert account boas_vindas_settings" ON public.boas_vindas_settings;
DROP POLICY IF EXISTS "Members can update account boas_vindas_settings" ON public.boas_vindas_settings;
DROP POLICY IF EXISTS "Members can delete account boas_vindas_settings" ON public.boas_vindas_settings;

CREATE POLICY "boas_vindas_settings_select_policy"
  ON public.boas_vindas_settings
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND account_id = public.current_account_id()
  );

CREATE POLICY "boas_vindas_settings_insert_policy"
  ON public.boas_vindas_settings
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND account_id = public.current_account_id()
  );

CREATE POLICY "boas_vindas_settings_update_policy"
  ON public.boas_vindas_settings
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND account_id = public.current_account_id()
  );

CREATE POLICY "boas_vindas_settings_delete_policy"
  ON public.boas_vindas_settings
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL
    AND account_id = public.current_account_id()
  );

-- ============================================================================
-- Update logsgeral policies to handle account_id and owner_id
-- ============================================================================

DROP POLICY IF EXISTS "logsgeral_select_policy" ON public.logsgeral;
DROP POLICY IF EXISTS "logsgeral_insert_policy" ON public.logsgeral;
DROP POLICY IF EXISTS "logsgeral_update_policy" ON public.logsgeral;

CREATE POLICY "logsgeral_select_policy"
  ON public.logsgeral
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND account_id = public.current_account_id()
  );

CREATE POLICY "logsgeral_insert_policy"
  ON public.logsgeral
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND account_id = public.current_account_id()
  );

CREATE POLICY "logsgeral_update_policy"
  ON public.logsgeral
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND account_id = public.current_account_id()
  );

-- ============================================================================
-- Update logsluna policies to handle account_id and owner_id
-- ============================================================================

DROP POLICY IF EXISTS "Members can view account logsluna" ON public.logsluna;
DROP POLICY IF EXISTS "Members can insert account logsluna" ON public.logsluna;
DROP POLICY IF EXISTS "Members can update account logsluna" ON public.logsluna;
DROP POLICY IF EXISTS "Members can delete account logsluna" ON public.logsluna;

CREATE POLICY "logsluna_select_policy"
  ON public.logsluna
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND account_id = public.current_account_id()
  );

CREATE POLICY "logsluna_insert_policy"
  ON public.logsluna
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND account_id = public.current_account_id()
  );

CREATE POLICY "logsluna_update_policy"
  ON public.logsluna
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND account_id = public.current_account_id()
  );

CREATE POLICY "logsluna_delete_policy"
  ON public.logsluna
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL
    AND account_id = public.current_account_id()
  );

-- ============================================================================
-- Update telegram_sessions policies to handle owner_id
-- ============================================================================

DROP POLICY IF EXISTS "Users can view only their own sessions" ON public.telegram_sessions;
DROP POLICY IF EXISTS "Members can view account telegram_sessions" ON public.telegram_sessions;
DROP POLICY IF EXISTS "Members can insert account telegram_sessions" ON public.telegram_sessions;
DROP POLICY IF EXISTS "Members can update account telegram_sessions" ON public.telegram_sessions;
DROP POLICY IF EXISTS "if_not_exists_telegram_sessions_select" ON public.telegram_sessions;

CREATE POLICY "telegram_sessions_select_policy"
  ON public.telegram_sessions
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (
      owner_id = public.current_account_id()
      OR owner_id = auth.uid()
    )
  );

CREATE POLICY "telegram_sessions_insert_policy"
  ON public.telegram_sessions
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      owner_id = public.current_account_id()
      OR owner_id = auth.uid()
    )
  );

CREATE POLICY "telegram_sessions_update_policy"
  ON public.telegram_sessions
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND (
      owner_id = public.current_account_id()
      OR owner_id = auth.uid()
    )
  );

-- ============================================================================
-- Create whoami RPC for testing
-- ============================================================================

CREATE OR REPLACE FUNCTION public.whoami()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'auth_uid', auth.uid(),
    'account_id', (SELECT account_id FROM profiles WHERE id = auth.uid()),
    'email', (SELECT email FROM profiles WHERE id = auth.uid())
  );
$$;