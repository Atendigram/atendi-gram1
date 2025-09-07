-- Create account_members table
CREATE TABLE public.account_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(account_id, user_id)
);

-- Enable RLS on account_members
ALTER TABLE public.account_members ENABLE ROW LEVEL SECURITY;

-- Create policy for account_members - users can only see memberships for accounts they belong to
CREATE POLICY "Users can view their own memberships" ON public.account_members
  FOR SELECT USING (user_id = auth.uid());

-- Create helper function to check if user is member of account
CREATE OR REPLACE FUNCTION public.is_member_of(account_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.account_members am
    WHERE am.account_id = $1
      AND am.user_id = auth.uid()
  )
$$;

-- Also check if user is the account owner (from profiles table)
CREATE OR REPLACE FUNCTION public.is_account_member_or_owner(account_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.account_members am
    WHERE am.account_id = $1 AND am.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.account_id = $1 AND p.id = auth.uid()
  )
$$;

-- Enable RLS and create policies for contacts table
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read contacts" ON public.contacts;
DROP POLICY IF EXISTS "rw by account on contacts" ON public.contacts;

CREATE POLICY "Members can view account contacts" ON public.contacts
  FOR SELECT USING (public.is_account_member_or_owner(account_id));

CREATE POLICY "Members can insert account contacts" ON public.contacts
  FOR INSERT WITH CHECK (public.is_account_member_or_owner(account_id));

CREATE POLICY "Members can update account contacts" ON public.contacts
  FOR UPDATE USING (public.is_account_member_or_owner(account_id))
  WITH CHECK (public.is_account_member_or_owner(account_id));

CREATE POLICY "Members can delete account contacts" ON public.contacts
  FOR DELETE USING (public.is_account_member_or_owner(account_id));

-- Enable RLS and create policies for contatos_luna table
ALTER TABLE public.contatos_luna ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "UPDATE" ON public.contatos_luna;
DROP POLICY IF EXISTS "allow_all_contatos_luna" ON public.contatos_luna;
DROP POLICY IF EXISTS "allow_insert_all" ON public.contatos_luna;
DROP POLICY IF EXISTS "rw by account on contatos_luna" ON public.contatos_luna;

CREATE POLICY "Members can view account contatos_luna" ON public.contatos_luna
  FOR SELECT USING (public.is_account_member_or_owner(account_id));

CREATE POLICY "Members can insert account contatos_luna" ON public.contatos_luna
  FOR INSERT WITH CHECK (public.is_account_member_or_owner(account_id));

CREATE POLICY "Members can update account contatos_luna" ON public.contatos_luna
  FOR UPDATE USING (public.is_account_member_or_owner(account_id))
  WITH CHECK (public.is_account_member_or_owner(account_id));

CREATE POLICY "Members can delete account contatos_luna" ON public.contatos_luna
  FOR DELETE USING (public.is_account_member_or_owner(account_id));

-- Enable RLS and create policies for messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read messages" ON public.messages;
DROP POLICY IF EXISTS "rw by account on messages" ON public.messages;

CREATE POLICY "Members can view account messages" ON public.messages
  FOR SELECT USING (public.is_account_member_or_owner(account_id));

CREATE POLICY "Members can insert account messages" ON public.messages
  FOR INSERT WITH CHECK (public.is_account_member_or_owner(account_id));

CREATE POLICY "Members can update account messages" ON public.messages
  FOR UPDATE USING (public.is_account_member_or_owner(account_id))
  WITH CHECK (public.is_account_member_or_owner(account_id));

CREATE POLICY "Members can delete account messages" ON public.messages
  FOR DELETE USING (public.is_account_member_or_owner(account_id));

-- Enable RLS and create policies for logsluna table
ALTER TABLE public.logsluna ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_logsluna" ON public.logsluna;
DROP POLICY IF EXISTS "insert_logs" ON public.logsluna;
DROP POLICY IF EXISTS "rw by account on logsluna" ON public.logsluna;

CREATE POLICY "Members can view account logsluna" ON public.logsluna
  FOR SELECT USING (public.is_account_member_or_owner(account_id));

CREATE POLICY "Members can insert account logsluna" ON public.logsluna
  FOR INSERT WITH CHECK (public.is_account_member_or_owner(account_id));

CREATE POLICY "Members can update account logsluna" ON public.logsluna
  FOR UPDATE USING (public.is_account_member_or_owner(account_id))
  WITH CHECK (public.is_account_member_or_owner(account_id));

CREATE POLICY "Members can delete account logsluna" ON public.logsluna
  FOR DELETE USING (public.is_account_member_or_owner(account_id));

-- Enable RLS and create policies for disparos table
ALTER TABLE public.disparos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insert_disparos" ON public.disparos;
DROP POLICY IF EXISTS "read_disparos" ON public.disparos;

CREATE POLICY "Members can view account disparos" ON public.disparos
  FOR SELECT USING (public.is_account_member_or_owner(account_id));

CREATE POLICY "Members can insert account disparos" ON public.disparos
  FOR INSERT WITH CHECK (public.is_account_member_or_owner(account_id));

CREATE POLICY "Members can update account disparos" ON public.disparos
  FOR UPDATE USING (public.is_account_member_or_owner(account_id))
  WITH CHECK (public.is_account_member_or_owner(account_id));

CREATE POLICY "Members can delete account disparos" ON public.disparos
  FOR DELETE USING (public.is_account_member_or_owner(account_id));

-- Enable RLS and create policies for disparo_items table
ALTER TABLE public.disparo_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insert_disparo_items" ON public.disparo_items;
DROP POLICY IF EXISTS "read_disparo_items" ON public.disparo_items;
DROP POLICY IF EXISTS "update_disparo_items_status" ON public.disparo_items;

CREATE POLICY "Members can view account disparo_items" ON public.disparo_items
  FOR SELECT USING (public.is_account_member_or_owner(account_id));

CREATE POLICY "Members can insert account disparo_items" ON public.disparo_items
  FOR INSERT WITH CHECK (public.is_account_member_or_owner(account_id));

CREATE POLICY "Members can update account disparo_items" ON public.disparo_items
  FOR UPDATE USING (public.is_account_member_or_owner(account_id))
  WITH CHECK (public.is_account_member_or_owner(account_id));

CREATE POLICY "Members can delete account disparo_items" ON public.disparo_items
  FOR DELETE USING (public.is_account_member_or_owner(account_id));