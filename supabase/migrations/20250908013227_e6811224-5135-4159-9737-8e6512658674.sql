-- Fix security issue: Add account-based access control to welcome system tables

-- 1. Add account_id to boas_vindas_settings table
ALTER TABLE public.boas_vindas_settings 
ADD COLUMN account_id uuid REFERENCES public.accounts(id);

-- 2. Add account_id to welcome_flows table  
ALTER TABLE public.welcome_flows
ADD COLUMN account_id uuid REFERENCES public.accounts(id);

-- 3. Add account_id to welcome_flow_steps table
ALTER TABLE public.welcome_flow_steps
ADD COLUMN account_id uuid REFERENCES public.accounts(id);

-- 4. Set account_id for existing records (assign to first available account as fallback)
UPDATE public.boas_vindas_settings 
SET account_id = (SELECT id FROM public.accounts LIMIT 1)
WHERE account_id IS NULL;

UPDATE public.welcome_flows 
SET account_id = (SELECT id FROM public.accounts LIMIT 1)
WHERE account_id IS NULL;

UPDATE public.welcome_flow_steps 
SET account_id = (SELECT id FROM public.accounts LIMIT 1)
WHERE account_id IS NULL;

-- 5. Make account_id required
ALTER TABLE public.boas_vindas_settings 
ALTER COLUMN account_id SET NOT NULL;

ALTER TABLE public.welcome_flows
ALTER COLUMN account_id SET NOT NULL;

ALTER TABLE public.welcome_flow_steps
ALTER COLUMN account_id SET NOT NULL;

-- 6. Drop existing insecure policies for boas_vindas_settings
DROP POLICY IF EXISTS "All authenticated users can delete boas_vindas_settings" ON public.boas_vindas_settings;
DROP POLICY IF EXISTS "All authenticated users can insert boas_vindas_settings" ON public.boas_vindas_settings;
DROP POLICY IF EXISTS "All authenticated users can update boas_vindas_settings" ON public.boas_vindas_settings;
DROP POLICY IF EXISTS "All authenticated users can view boas_vindas_settings" ON public.boas_vindas_settings;

-- 7. Create secure account-based policies for boas_vindas_settings
CREATE POLICY "Members can view account boas_vindas_settings" 
ON public.boas_vindas_settings 
FOR SELECT 
USING (is_account_member_or_owner(account_id));

CREATE POLICY "Members can insert account boas_vindas_settings" 
ON public.boas_vindas_settings 
FOR INSERT 
WITH CHECK (is_account_member_or_owner(account_id));

CREATE POLICY "Members can update account boas_vindas_settings" 
ON public.boas_vindas_settings 
FOR UPDATE 
USING (is_account_member_or_owner(account_id))
WITH CHECK (is_account_member_or_owner(account_id));

CREATE POLICY "Members can delete account boas_vindas_settings" 
ON public.boas_vindas_settings 
FOR DELETE 
USING (is_account_member_or_owner(account_id));

-- 8. Drop existing policies for welcome_flows
DROP POLICY IF EXISTS "Allow all operations on welcome_flows" ON public.welcome_flows;

-- 9. Create secure policies for welcome_flows
CREATE POLICY "Members can view account welcome_flows" 
ON public.welcome_flows 
FOR SELECT 
USING (is_account_member_or_owner(account_id));

CREATE POLICY "Members can insert account welcome_flows" 
ON public.welcome_flows 
FOR INSERT 
WITH CHECK (is_account_member_or_owner(account_id));

CREATE POLICY "Members can update account welcome_flows" 
ON public.welcome_flows 
FOR UPDATE 
USING (is_account_member_or_owner(account_id))
WITH CHECK (is_account_member_or_owner(account_id));

CREATE POLICY "Members can delete account welcome_flows" 
ON public.welcome_flows 
FOR DELETE 
USING (is_account_member_or_owner(account_id));

-- 10. Drop existing policies for welcome_flow_steps
DROP POLICY IF EXISTS "Allow all operations on welcome_flow_steps" ON public.welcome_flow_steps;

-- 11. Create secure policies for welcome_flow_steps
CREATE POLICY "Members can view account welcome_flow_steps" 
ON public.welcome_flow_steps 
FOR SELECT 
USING (is_account_member_or_owner(account_id));

CREATE POLICY "Members can insert account welcome_flow_steps" 
ON public.welcome_flow_steps 
FOR INSERT 
WITH CHECK (is_account_member_or_owner(account_id));

CREATE POLICY "Members can update account welcome_flow_steps" 
ON public.welcome_flow_steps 
FOR UPDATE 
USING (is_account_member_or_owner(account_id))
WITH CHECK (is_account_member_or_owner(account_id));

CREATE POLICY "Members can delete account welcome_flow_steps" 
ON public.welcome_flow_steps 
FOR DELETE 
USING (is_account_member_or_owner(account_id));