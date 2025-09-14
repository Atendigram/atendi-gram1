-- Remove restrictive status CHECK to allow updates used by the app
ALTER TABLE public.telegram_sessions
  DROP CONSTRAINT IF EXISTS telegram_sessions_status_check;