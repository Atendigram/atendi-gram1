-- Security fix: Update all database functions to include SET search_path = 'public'

-- Update fn_mark_invalid_contact function
CREATE OR REPLACE FUNCTION public.fn_mark_invalid_contact()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
begin
  -- falhou por privacidade/bloqueio
  if new.status = 'failed'
     and (
       coalesce(new.fail_reason,'') ilike '%PEER_ID_INVALID%'
       or coalesce(new.fail_reason,'') ilike '%USER_PRIVACY_RESTRICTED%'
       or coalesce(new.error,'') = 'need_handshake'
       or coalesce(new.error,'') = 'blocked_by_user'
     ) then
    update public.contatos_luna c
       set status         = 'invalid',
           fail_count     = c.fail_count + 1,
           invalid_reason = coalesce(new.fail_reason, new.error),
           invalid_at     = now()
     where c.tg_id = new.tg_id;
  end if;

  -- sucesso reativa
  if new.status = 'sent' then
    update public.contatos_luna c
       set status         = 'active',
           invalid_reason = null
     where c.tg_id = new.tg_id;
  end if;

  return new;
end;
$function$;

-- Update trg_skip_channels function
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

-- Update fn_set_updated_at function
CREATE OR REPLACE FUNCTION public.fn_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

-- Update is_member_of function
CREATE OR REPLACE FUNCTION public.is_member_of(account_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.account_members am
    WHERE am.account_id = $1
      AND am.user_id = auth.uid()
  )
$function$;

-- Update is_account_member_or_owner function
CREATE OR REPLACE FUNCTION public.is_account_member_or_owner(account_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.account_members am
    WHERE am.account_id = $1 AND am.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.account_id = $1 AND p.id = auth.uid()
  )
$function$;

-- Update dequeue_disparo_item function
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

-- Update create_campaign_and_enqueue function
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

-- Update ack_disparo_item function
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

-- Update disparo_set_minute_epoch function
CREATE OR REPLACE FUNCTION public.disparo_set_minute_epoch()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  -- minuto = epoch/60 (arredonda pra baixo)
  NEW.created_minute_epoch :=
    floor(extract(epoch FROM NEW.created_at)::numeric / 60)::bigint;
  RETURN NEW;
END
$function$;