-- Create a helper function to check if a profile has a connected Telegram session
CREATE OR REPLACE FUNCTION public.profile_has_connected_telegram(_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM telegram_sessions ts
    JOIN profiles p ON p.id = _profile_id
    WHERE ts.status = 'connected'
      AND (ts.owner_id = p.id OR ts.owner_id = p.account_id)
  );
$$;

-- Create a view to get all connected profiles with their session info
CREATE OR REPLACE VIEW public.connected_profiles AS
SELECT DISTINCT
  p.id AS profile_id,
  p.email,
  p.display_name,
  p.account_id,
  ts.phone_number,
  ts.status,
  ts.id AS session_id,
  ts.created_at AS connected_at
FROM profiles p
JOIN telegram_sessions ts
  ON ts.owner_id = p.id OR ts.owner_id = p.account_id
WHERE ts.status = 'connected';

-- Grant access to authenticated users for the view
GRANT SELECT ON public.connected_profiles TO authenticated;