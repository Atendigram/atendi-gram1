-- Fix 1: Enable RLS on users table and add owner-only policy
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own record"
ON public.users
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Fix 2: Remove anonymous access to profiles
DROP POLICY IF EXISTS "public_read_profiles" ON public.profiles;

DROP POLICY IF EXISTS "anon_can_read_accounts" ON public.accounts;

-- Fix 3: Restrict telegram_sessions access - drop overly permissive policy
DROP POLICY IF EXISTS "anon_can_read_own_sessions" ON public.telegram_sessions;

-- Only allow users to view their own sessions
CREATE POLICY "Users can view only their own sessions"
ON public.telegram_sessions
FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

-- Fix 4: Fix infinite recursion in account_members
-- First, drop the problematic policy
DROP POLICY IF EXISTS "if_not_exists_account_members_select" ON public.account_members;

-- Create a helper function to check membership without recursion
CREATE OR REPLACE FUNCTION public.check_account_membership(_account_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM account_members
    WHERE user_id = auth.uid() AND account_id = _account_id
  )
$$;

-- Add non-recursive policy using the helper function
CREATE POLICY "Members can view account memberships"
ON public.account_members
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR 
  public.check_account_membership(account_id)
);