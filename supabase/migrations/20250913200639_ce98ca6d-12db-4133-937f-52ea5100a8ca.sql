-- Update database functions to use contatos_geral instead of contatos_luna

-- Update fn_mark_invalid_contact function
CREATE OR REPLACE FUNCTION public.fn_mark_invalid_contact()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
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
    update public.contatos_geral c
       set status         = 'invalid',
           fail_count     = c.fail_count + 1,
           invalid_reason = coalesce(new.fail_reason, new.error),
           invalid_at     = now()
     where c.tg_id = new.tg_id;
  end if;

  -- sucesso reativa
  if new.status = 'sent' then
    update public.contatos_geral c
       set status         = 'active',
           invalid_reason = null
     where c.tg_id = new.tg_id;
  end if;

  return new;
end;
$function$;

-- Update create_campaign_and_enqueue function
CREATE OR REPLACE FUNCTION public.create_campaign_and_enqueue(p_name text, p_content text, p_media_url text, p_scheduled_at timestamp with time zone)
RETURNS TABLE(campaign_id uuid, enqueued integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

  -- 3) gera os itens (1 por contato com chat_id) - Updated to use contatos_geral
  insert into public.disparo_items
    (account_id, campaign_id, contact_id, tg_id, payload, scheduled_at)
  select
      v_account,
      v_campaign,
      null::uuid,
      coalesce(cast(cg.chat_id as text), null),
      jsonb_build_object('text', p_content, 'media_url', p_media_url),
      p_scheduled_at
  from public.contatos_geral cg
  where cg.account_id = v_account
    and cg.chat_id is not null;

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