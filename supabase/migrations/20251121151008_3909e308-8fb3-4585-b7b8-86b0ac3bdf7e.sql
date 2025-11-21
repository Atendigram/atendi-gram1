-- Drop old update policy
DROP POLICY IF EXISTS "update own profile" ON public.profiles;

-- Create new comprehensive update policy
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Grant explicit UPDATE permission on display_name column
GRANT UPDATE (display_name, email) ON public.profiles TO authenticated;