-- Fix all RLS policies and functions to use correct account_id mapping
-- Pattern: account_id = (SELECT account_id FROM profiles WHERE id = auth.uid())

-- ============================================================================
-- 1. Fix contatos_geral policies
-- ============================================================================

DROP POLICY IF EXISTS "contatos_geral_by_account_select" ON public.contatos_geral;

CREATE POLICY "contatos_geral_by_account_select" 
ON public.contatos_geral 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND account_id = (
    SELECT account_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- ============================================================================
-- 2. Fix produtos_modelos policies
-- ============================================================================

DROP POLICY IF EXISTS "Modelos só veem seus produtos" ON public.produtos_modelos;
DROP POLICY IF EXISTS "Modelos só inserem seus produtos" ON public.produtos_modelos;
DROP POLICY IF EXISTS "Modelos só atualizam seus produtos" ON public.produtos_modelos;
DROP POLICY IF EXISTS "Modelos só deletam seus produtos" ON public.produtos_modelos;

CREATE POLICY "Modelos só veem seus produtos" 
ON public.produtos_modelos 
FOR SELECT 
USING (
  account_id = (
    SELECT account_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Modelos só inserem seus produtos" 
ON public.produtos_modelos 
FOR INSERT 
WITH CHECK (
  account_id = (
    SELECT account_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Modelos só atualizam seus produtos" 
ON public.produtos_modelos 
FOR UPDATE 
USING (
  account_id = (
    SELECT account_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Modelos só deletam seus produtos" 
ON public.produtos_modelos 
FOR DELETE 
USING (
  account_id = (
    SELECT account_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- ============================================================================
-- 3. Fix logsgeral policies
-- ============================================================================

DROP POLICY IF EXISTS "logsgeral_select_policy" ON public.logsgeral;
DROP POLICY IF EXISTS "logsgeral_insert_policy" ON public.logsgeral;
DROP POLICY IF EXISTS "logsgeral_update_policy" ON public.logsgeral;

CREATE POLICY "logsgeral_select_policy" 
ON public.logsgeral 
FOR SELECT 
USING (
  account_id = (
    SELECT account_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "logsgeral_insert_policy" 
ON public.logsgeral 
FOR INSERT 
WITH CHECK (
  account_id = (
    SELECT account_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "logsgeral_update_policy" 
ON public.logsgeral 
FOR UPDATE 
USING (
  account_id = (
    SELECT account_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- ============================================================================
-- 4. Fix accounts policies (owner_id references auth.users)
-- ============================================================================

-- These policies are correct because owner_id IS the auth.uid()
-- No changes needed for accounts table

-- ============================================================================
-- 5. Update get_dashboard_metrics function to use account_id correctly
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_dashboard_metrics()
RETURNS TABLE(total_contacts bigint, contacts_today bigint, messages_month bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $function$
  WITH user_account AS (
    SELECT account_id 
    FROM profiles 
    WHERE id = auth.uid()
  )
  SELECT
    -- total de contatos da conta
    (SELECT COUNT(*) 
     FROM contatos_geral cg
     CROSS JOIN user_account ua
     WHERE cg.account_id = ua.account_id) AS total_contacts,

    -- contatos novos do dia da conta
    (SELECT COUNT(*) 
     FROM contatos_geral cg
     CROSS JOIN user_account ua
     WHERE cg.account_id = ua.account_id
       AND cg.created_at::date = CURRENT_DATE) AS contacts_today,

    -- mensagens disparadas no mês da conta
    (SELECT COUNT(*)
     FROM disparo_items di
     CROSS JOIN user_account ua
     WHERE di.account_id = ua.account_id
       AND di.status = 'sent'
       AND date_trunc('month', di.created_at) = date_trunc('month', CURRENT_DATE)
    ) AS messages_month;
$function$;