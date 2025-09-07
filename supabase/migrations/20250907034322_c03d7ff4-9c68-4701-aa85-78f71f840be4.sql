-- Enable RLS on remaining tables that don't have it

-- Enable RLS on accounts table (already has some policies)
-- ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY; -- Already enabled

-- Enable RLS on conversations table and add missing policies
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if exists and create comprehensive ones
DROP POLICY IF EXISTS "read conversations" ON public.conversations;

CREATE POLICY "Members can view conversations" ON public.conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.contacts c
      WHERE c.id = conversations.contact_id
        AND public.is_account_member_or_owner(c.account_id)
    )
  );

CREATE POLICY "Members can insert conversations" ON public.conversations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.contacts c
      WHERE c.id = conversations.contact_id
        AND public.is_account_member_or_owner(c.account_id)
    )
  );

CREATE POLICY "Members can update conversations" ON public.conversations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.contacts c
      WHERE c.id = conversations.contact_id
        AND public.is_account_member_or_owner(c.account_id)
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.contacts c
      WHERE c.id = conversations.contact_id
        AND public.is_account_member_or_owner(c.account_id)
    )
  );

CREATE POLICY "Members can delete conversations" ON public.conversations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.contacts c
      WHERE c.id = conversations.contact_id
        AND public.is_account_member_or_owner(c.account_id)
    )
  );

-- Enable RLS on boas_vindas_settings table
ALTER TABLE public.boas_vindas_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view boas_vindas_settings" ON public.boas_vindas_settings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "All authenticated users can insert boas_vindas_settings" ON public.boas_vindas_settings
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "All authenticated users can update boas_vindas_settings" ON public.boas_vindas_settings
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "All authenticated users can delete boas_vindas_settings" ON public.boas_vindas_settings
  FOR DELETE TO authenticated USING (true);

-- Fix existing function search paths to be immutable
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
declare
  v_account_id uuid;
begin
  insert into public.accounts (owner_id, name)
  values (new.id, coalesce(split_part(new.email, '@', 1), 'owner'))
  returning id into v_account_id;

  insert into public.profiles (id, account_id, email, display_name)
  values (new.id, v_account_id, new.email, split_part(new.email, '@', 1));

  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.trg_skip_channels()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.create_campaign_and_enqueue(p_name text, p_content text, p_media_url text, p_scheduled_at timestamp with time zone)
RETURNS TABLE(campaign_id uuid, enqueued integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
declare
  v_account  uuid;
  v_campaign uuid;
begin
  -- 1) pega a conta do usuário atual
  select account_id
    into v_account
  from public.profiles
  where id = auth.uid();

  if v_account is null then
    raise exception 'No account for current user';
  end if;

  -- 2) cria a campanha
  insert into public.disparos
    (account_id, name, content, media_url, scheduled_at, status, created_by)
  values
    (v_account, p_name, p_content, p_media_url, p_scheduled_at, 'scheduled', auth.uid())
  returning id into v_campaign;

  -- 3) gera os itens (1 por contato com chat_id)
  insert into public.disparo_items
    (account_id, campaign_id, contact_id, tg_id, payload, scheduled_at)
  select
      v_account,
      v_campaign,
      null::uuid,
      coalesce(cast(cl.chat_id as text), null),
      jsonb_build_object('text', p_content, 'media_url', p_media_url),
      p_scheduled_at
  from public.contatos_luna cl
  where cl.account_id = v_account
    and cl.chat_id is not null;

  -- 4) atualiza contadores da campanha
  update public.disparos d
  set total_targets = (
        select count(*)
        from public.disparo_items di
        where di.campaign_id = v_campaign
      ),
      queued_count = (
        select count(*)
        from public.disparo_items di
        where di.campaign_id = v_campaign
          and di.status = 'queued'
      )
  where d.id = v_campaign;

  -- 5) retorna id da campanha e o total enfileirado
  return query
select v_campaign,
       (select count(*)::int from public.disparo_items di
         where di.campaign_id = v_campaign);

end;
$function$;

CREATE OR REPLACE FUNCTION public.dequeue_disparo_item()
RETURNS TABLE(item_id uuid, account_id uuid, campaign_id uuid, contact_id uuid, tg_id bigint, payload jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
begin
  return query
  with next_item as (
    select id
    from public.disparo_items
    where status = 'queued'
    order by created_at
    for update skip locked
    limit 1
  )
  update public.disparo_items di
     set status    = 'sending',
         attempts  = coalesce(di.attempts, 0) + 1,
         updated_at = now()
  from next_item n
  where di.id = n.id
  returning di.id, di.account_id, di.campaign_id, di.contact_id, di.tg_id, di.payload;
end;
$function$;

CREATE OR REPLACE FUNCTION public.ack_disparo_item(_item_id uuid, _ok boolean, _err text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
begin
  if _ok then
    update public.disparo_items
       set status    = 'sent',
           sent_at   = now(),
           error     = null,
           updated_at = now()
     where id = _item_id;
  else
    update public.disparo_items
       set status    = 'failed',
           error     = _err,
           updated_at = now()
     where id = _item_id;
  end if;

  -- (opcional) atualiza agregados da campanha
  update public.disparos d
     set total_targets = (select count(*) from public.disparo_items di where di.campaign_id = d.id),
         queued_count  = (select count(*) from public.disparo_items di where di.campaign_id = d.id and di.status = 'queued')
   where d.id = (select campaign_id from public.disparo_items where id = _item_id);
end;
$function$;