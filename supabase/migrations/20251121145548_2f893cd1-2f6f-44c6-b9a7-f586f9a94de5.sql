-- Drop the restrictive update policy
DROP POLICY IF EXISTS "Cada usuário atualiza só sua conta" ON public.accounts;

-- Create new update policy that allows users to update accounts they have access to via profiles
CREATE POLICY "Users can update their account via profile" 
ON public.accounts
FOR UPDATE
USING (
  id IN (
    SELECT account_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
)
WITH CHECK (
  id IN (
    SELECT account_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- Also update the select policy to be consistent
DROP POLICY IF EXISTS "Cada usuário vê só sua conta" ON public.accounts;

CREATE POLICY "Users can view their account via profile"
ON public.accounts
FOR SELECT
USING (
  id IN (
    SELECT account_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);