-- Normalize telegram_sessions RLS and add updated_at trigger
alter table public.telegram_sessions enable row level security;

-- Drop conflicting/duplicate policies if they exist
DROP POLICY IF EXISTS "Allow authenticated inserts telegram_sessions" ON public.telegram_sessions;
DROP POLICY IF EXISTS "Allow authenticated to insert telegram_sessions" ON public.telegram_sessions;
DROP POLICY IF EXISTS "Allow authenticated to update own telegram_sessions" ON public.telegram_sessions;
DROP POLICY IF EXISTS "Allow inserts for all authenticated" ON public.telegram_sessions;
DROP POLICY IF EXISTS "Allow logged-in updates own telegram_sessions" ON public.telegram_sessions;
DROP POLICY IF EXISTS "Members can view account telegram_sessions" ON public.telegram_sessions;
DROP POLICY IF EXISTS "Members can insert account telegram_sessions" ON public.telegram_sessions;
DROP POLICY IF EXISTS "Members can update account telegram_sessions" ON public.telegram_sessions;

-- Create consistent, secure policies using helper
CREATE POLICY "Members can view account telegram_sessions"
ON public.telegram_sessions
FOR SELECT
USING (public.is_account_member_or_owner(account_id));

CREATE POLICY "Members can insert account telegram_sessions"
ON public.telegram_sessions
FOR INSERT
WITH CHECK (public.is_account_member_or_owner(account_id));

CREATE POLICY "Members can update account telegram_sessions"
ON public.telegram_sessions
FOR UPDATE
USING (public.is_account_member_or_owner(account_id))
WITH CHECK (public.is_account_member_or_owner(account_id));

-- Keep timestamps fresh on update
DROP TRIGGER IF EXISTS set_updated_at_telegram_sessions ON public.telegram_sessions;
CREATE TRIGGER set_updated_at_telegram_sessions
BEFORE UPDATE ON public.telegram_sessions
FOR EACH ROW
EXECUTE FUNCTION public.set_timestamp_telegram_sessions();