-- Corrigir recursão infinita nas policies da tabela profiles
-- Remover policies problemáticas que causam recursão

DROP POLICY IF EXISTS "admin_read_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "if_not_exists_profiles_select" ON public.profiles;

-- Recriar policy de admin sem recursão (usando função security definer)
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  )
$$;

-- Policy para admins verem todos os perfis (sem recursão)
CREATE POLICY "admin_read_all_profiles" ON public.profiles
  FOR SELECT
  USING (public.is_admin_user());

-- Policy para membros da mesma conta verem perfis (sem recursão)
CREATE POLICY "account_members_read_profiles" ON public.profiles
  FOR SELECT
  USING (
    id = auth.uid() 
    OR account_id IN (
      SELECT account_id FROM public.account_members WHERE user_id = auth.uid()
    )
  );