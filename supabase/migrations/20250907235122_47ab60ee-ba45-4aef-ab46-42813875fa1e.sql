-- Enable Row Level Security on messages_log table
ALTER TABLE public.messages_log ENABLE ROW LEVEL SECURITY;

-- Create policy to allow only service role to access messages_log
-- This table is used for internal message tracking and should not be accessible to regular users
CREATE POLICY "Service role can access messages_log" 
ON public.messages_log 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Create policy to prevent regular authenticated users from accessing this sensitive table
CREATE POLICY "Restrict user access to messages_log" 
ON public.messages_log 
FOR ALL 
TO authenticated 
USING (false) 
WITH CHECK (false);