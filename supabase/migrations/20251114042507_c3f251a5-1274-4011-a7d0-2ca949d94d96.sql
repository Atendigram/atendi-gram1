-- Drop the connected_profiles view - we'll query canonical tables directly
DROP VIEW IF EXISTS public.connected_profiles;

-- Keep the helper function as it's useful and queries canonical tables
-- The function profile_has_connected_telegram() already exists and is fine