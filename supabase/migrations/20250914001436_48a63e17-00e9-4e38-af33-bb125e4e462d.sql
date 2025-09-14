-- Fix RLS helper: treat account owner as member as well
CREATE OR REPLACE FUNCTION public.is_account_member_or_owner(account_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    EXISTS (
      SELECT 1 FROM public.account_members am
      WHERE am.account_id = $1 AND am.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.account_id = $1 AND p.id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = $1 AND a.owner_id = auth.uid()
    );
$$;