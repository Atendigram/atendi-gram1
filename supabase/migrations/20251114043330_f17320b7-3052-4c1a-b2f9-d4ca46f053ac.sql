-- Ensure RLS policies allow reading sessions by owner_id matching profile.id OR profile.account_id
-- Drop existing policies and recreate them correctly
DROP POLICY IF EXISTS telegram_sessions_select_policy ON public.telegram_sessions;
DROP POLICY IF EXISTS telegram_sessions_insert_policy ON public.telegram_sessions;
DROP POLICY IF EXISTS telegram_sessions_update_policy ON public.telegram_sessions;

-- Allow SELECT if the session's owner_id matches the user's profile.id OR account_id
CREATE POLICY telegram_sessions_select_policy ON public.telegram_sessions
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND (
    owner_id = auth.uid() 
    OR owner_id = current_account_id()
  )
);

-- Allow INSERT if owner_id is the user's id or account_id
CREATE POLICY telegram_sessions_insert_policy ON public.telegram_sessions
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND (
    owner_id = auth.uid() 
    OR owner_id = current_account_id()
  )
);

-- Allow UPDATE if owner_id is the user's id or account_id
CREATE POLICY telegram_sessions_update_policy ON public.telegram_sessions
FOR UPDATE
USING (
  auth.uid() IS NOT NULL 
  AND (
    owner_id = auth.uid() 
    OR owner_id = current_account_id()
  )
);