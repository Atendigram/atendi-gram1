-- Add RLS policies for telegram_sessions table
ALTER TABLE public.telegram_sessions ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own account's telegram sessions
CREATE POLICY "Members can view account telegram_sessions" 
ON public.telegram_sessions 
FOR SELECT 
USING (is_account_member_or_owner(account_id));

-- Allow users to insert telegram sessions for their account
CREATE POLICY "Members can insert account telegram_sessions" 
ON public.telegram_sessions 
FOR INSERT 
WITH CHECK (is_account_member_or_owner(account_id));

-- Allow users to update their account's telegram sessions
CREATE POLICY "Members can update account telegram_sessions" 
ON public.telegram_sessions 
FOR UPDATE 
USING (is_account_member_or_owner(account_id))
WITH CHECK (is_account_member_or_owner(account_id));

-- Allow users to delete their account's telegram sessions
CREATE POLICY "Members can delete account telegram_sessions" 
ON public.telegram_sessions 
FOR DELETE 
USING (is_account_member_or_owner(account_id));