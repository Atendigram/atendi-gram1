-- Fix critical security issues

-- 1. Add missing RLS policies to conversations table
CREATE POLICY "Members can view account conversations"
ON public.conversations
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.messages m 
  WHERE m.conversation_id = conversations.id 
  AND is_account_member_or_owner(m.account_id)
));

CREATE POLICY "Members can insert account conversations"
ON public.conversations
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.messages m 
  WHERE m.conversation_id = conversations.id 
  AND is_account_member_or_owner(m.account_id)
));

CREATE POLICY "Members can update account conversations"
ON public.conversations
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.messages m 
  WHERE m.conversation_id = conversations.id 
  AND is_account_member_or_owner(m.account_id)
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.messages m 
  WHERE m.conversation_id = conversations.id 
  AND is_account_member_or_owner(m.account_id)
));

CREATE POLICY "Members can delete account conversations"
ON public.conversations
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.messages m 
  WHERE m.conversation_id = conversations.id 
  AND is_account_member_or_owner(m.account_id)
));

-- 2. Secure database functions by fixing search paths
CREATE OR REPLACE FUNCTION public.trg_skip_channels()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- se for canal/supergrupo (IDs -100...)
  IF (NEW.tg_id IS NOT NULL AND NEW.tg_id::bigint <= -1000000000000) THEN
    NEW.status := 'failed';
    NEW.fail_reason := COALESCE(NEW.fail_reason, 'skip: channel/supergroup');
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_failed_disparos()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  delete from disparo_items
  where status = 'failed'
     or error = 'cancelado manualmente';
end;
$function$;

CREATE OR REPLACE FUNCTION public.disparo_set_minute_epoch()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- minuto = epoch/60 (arredonda pra baixo)
  NEW.created_minute_epoch :=
    floor(extract(epoch FROM NEW.created_at)::numeric / 60)::bigint;
  RETURN NEW;
END
$function$;