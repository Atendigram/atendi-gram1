-- ============================================================
-- MIGRATION: Auto-Reply System Tables (Multi-Tenant)
-- 
-- MODELO: Cada criadora (account) tem suas próprias regras.
-- O isolamento é garantido por account_id + RLS.
-- 
-- Tabelas: auto_reply_rules, auto_reply_messages, auto_reply_log
-- Funções: check_auto_reply_cooldown, get_auto_reply_stats,
--          match_auto_reply_rules, pick_random_auto_reply_message
-- View:    auto_reply_rules_with_counts
--
-- Execute este SQL no Supabase SQL Editor
-- ============================================================


-- ============================================================
-- 1. TABELA: auto_reply_rules
-- Regras de auto-resposta com palavras-chave.
-- Cada criadora (account_id) gerencia suas próprias regras.
-- session_id permite vincular a regra a uma sessão específica
-- ou NULL para aplicar a todas as sessões da conta.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.auto_reply_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.telegram_sessions(id) ON DELETE SET NULL,
  -- NULL = aplica a todas as sessões da conta
  -- UUID = aplica apenas a esta sessão específica
  name TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  match_mode TEXT NOT NULL DEFAULT 'contains' 
    CHECK (match_mode IN ('contains', 'exact', 'any', 'all')),
  -- contains = substring match (ex: "oi" match "oitocentos")
  -- exact    = mensagem inteira igual a keyword
  -- any      = mensagem contém QUALQUER keyword como palavra isolada
  -- all      = mensagem contém TODAS as keywords como palavras isoladas
  enabled BOOLEAN NOT NULL DEFAULT true,
  cooldown_hours INTEGER DEFAULT NULL,
  -- NULL = one-shot (nunca re-dispara naquele chat)
  -- 0    = sempre dispara
  -- N    = re-dispara após N horas no mesmo chat
  priority INTEGER NOT NULL DEFAULT 0,
  -- Maior = mais prioritário. Se mensagem bate com 2+ regras, a de maior priority responde.
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.auto_reply_rules IS 'Regras de auto-resposta por conta (criadora). Cada account_id tem suas próprias regras isoladas.';
COMMENT ON COLUMN public.auto_reply_rules.account_id IS 'Conta da criadora. Garante isolamento multi-tenant.';
COMMENT ON COLUMN public.auto_reply_rules.session_id IS 'Sessão Telegram específica. NULL = aplica a todas as sessões da conta.';
COMMENT ON COLUMN public.auto_reply_rules.keywords IS 'Array de palavras-chave que acionam a regra.';
COMMENT ON COLUMN public.auto_reply_rules.match_mode IS 'Modo de correspondência: contains, exact, any, all.';
COMMENT ON COLUMN public.auto_reply_rules.cooldown_hours IS 'NULL=one-shot, 0=sempre, N=a cada N horas.';
COMMENT ON COLUMN public.auto_reply_rules.priority IS 'Maior valor = responde primeiro quando múltiplas regras batem.';

-- Índices
CREATE INDEX IF NOT EXISTS idx_auto_reply_rules_account 
  ON public.auto_reply_rules(account_id);
CREATE INDEX IF NOT EXISTS idx_auto_reply_rules_account_enabled 
  ON public.auto_reply_rules(account_id, enabled) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS idx_auto_reply_rules_priority 
  ON public.auto_reply_rules(account_id, priority DESC);
CREATE INDEX IF NOT EXISTS idx_auto_reply_rules_session 
  ON public.auto_reply_rules(session_id) WHERE session_id IS NOT NULL;

-- RLS
ALTER TABLE public.auto_reply_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auto_reply_rules_select"
  ON public.auto_reply_rules FOR SELECT
  USING (account_id IN (
    SELECT account_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "auto_reply_rules_insert"
  ON public.auto_reply_rules FOR INSERT
  WITH CHECK (account_id IN (
    SELECT account_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "auto_reply_rules_update"
  ON public.auto_reply_rules FOR UPDATE
  USING (account_id IN (
    SELECT account_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "auto_reply_rules_delete"
  ON public.auto_reply_rules FOR DELETE
  USING (account_id IN (
    SELECT account_id FROM public.profiles WHERE id = auth.uid()
  ));


-- ============================================================
-- 2. TABELA: auto_reply_messages
-- Pool de mensagens para cada regra.
-- Quando a regra é acionada, uma mensagem é escolhida
-- aleatoriamente deste pool.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.auto_reply_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id UUID NOT NULL REFERENCES public.auto_reply_rules(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'text' 
    CHECK (kind IN ('text', 'photo', 'audio', 'voice')),
  text_content TEXT,
  -- Suporta variáveis: {nome}, {primeiro_nome}, {username}, {data}, {hora}
  media_url TEXT,
  parse_mode TEXT DEFAULT 'none' 
    CHECK (parse_mode IN ('none', 'html', 'markdown')),
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.auto_reply_messages IS 'Pool de mensagens de cada regra. Seleção aleatória a cada disparo.';
COMMENT ON COLUMN public.auto_reply_messages.text_content IS 'Suporta variáveis dinâmicas: {nome}, {primeiro_nome}, {username}, {data}, {hora}';

-- Índices
CREATE INDEX IF NOT EXISTS idx_auto_reply_messages_rule 
  ON public.auto_reply_messages(rule_id);
CREATE INDEX IF NOT EXISTS idx_auto_reply_messages_account 
  ON public.auto_reply_messages(account_id);

-- RLS
ALTER TABLE public.auto_reply_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auto_reply_messages_select"
  ON public.auto_reply_messages FOR SELECT
  USING (account_id IN (
    SELECT account_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "auto_reply_messages_insert"
  ON public.auto_reply_messages FOR INSERT
  WITH CHECK (account_id IN (
    SELECT account_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "auto_reply_messages_update"
  ON public.auto_reply_messages FOR UPDATE
  USING (account_id IN (
    SELECT account_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "auto_reply_messages_delete"
  ON public.auto_reply_messages FOR DELETE
  USING (account_id IN (
    SELECT account_id FROM public.profiles WHERE id = auth.uid()
  ));


-- ============================================================
-- 3. TABELA: auto_reply_log
-- Registro de disparos realizados.
-- Usado para:
--   a) Controle de "já disparou neste chat" (cooldown / one-shot)
--   b) Dashboard de estatísticas
--   c) Auditoria
-- ============================================================
CREATE TABLE IF NOT EXISTS public.auto_reply_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id UUID NOT NULL REFERENCES public.auto_reply_rules(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.telegram_sessions(id) ON DELETE SET NULL,
  -- Qual sessão Telegram enviou a resposta
  chat_id BIGINT NOT NULL,
  -- ID do chat do Telegram onde o disparo aconteceu
  message_id_trigger BIGINT,
  -- ID da mensagem recebida que acionou a regra
  message_id_sent BIGINT,
  -- ID da mensagem de resposta enviada
  trigger_text TEXT,
  -- Texto da mensagem recebida que causou o match
  response_message_id UUID REFERENCES public.auto_reply_messages(id) ON DELETE SET NULL,
  -- Qual mensagem do pool foi selecionada
  responded_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.auto_reply_log IS 'Log de cada disparo automático. Isolado por account_id. Usado para cooldown e dashboard.';
COMMENT ON COLUMN public.auto_reply_log.session_id IS 'Qual sessão Telegram enviou a resposta automática.';

-- Índices (otimizados para verificação de cooldown)
CREATE INDEX IF NOT EXISTS idx_auto_reply_log_rule_chat 
  ON public.auto_reply_log(rule_id, chat_id);
CREATE INDEX IF NOT EXISTS idx_auto_reply_log_account 
  ON public.auto_reply_log(account_id);
CREATE INDEX IF NOT EXISTS idx_auto_reply_log_responded 
  ON public.auto_reply_log(responded_at DESC);
CREATE INDEX IF NOT EXISTS idx_auto_reply_log_cooldown_lookup
  ON public.auto_reply_log(rule_id, chat_id, responded_at DESC);
CREATE INDEX IF NOT EXISTS idx_auto_reply_log_session
  ON public.auto_reply_log(session_id) WHERE session_id IS NOT NULL;

-- RLS
ALTER TABLE public.auto_reply_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auto_reply_log_select"
  ON public.auto_reply_log FOR SELECT
  USING (account_id IN (
    SELECT account_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "auto_reply_log_insert"
  ON public.auto_reply_log FOR INSERT
  WITH CHECK (account_id IN (
    SELECT account_id FROM public.profiles WHERE id = auth.uid()
  ));


-- ============================================================
-- 4. FUNÇÃO: check_auto_reply_cooldown
-- Chamada pelo backend/worker para verificar se pode disparar.
--
-- Retorna TRUE se a regra pode disparar no chat, FALSE se não.
--
-- Lógica:
--   cooldown_hours IS NULL → one-shot (nunca re-dispara)
--   cooldown_hours = 0     → sempre dispara
--   cooldown_hours = N     → dispara se última resposta foi há mais de N horas
-- ============================================================
CREATE OR REPLACE FUNCTION public.check_auto_reply_cooldown(
  p_rule_id UUID,
  p_chat_id BIGINT,
  p_cooldown_hours INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  last_response TIMESTAMPTZ;
BEGIN
  -- One-shot: nunca re-dispara
  IF p_cooldown_hours IS NULL THEN
    RETURN NOT EXISTS (
      SELECT 1 FROM public.auto_reply_log
      WHERE rule_id = p_rule_id AND chat_id = p_chat_id
      LIMIT 1
    );
  END IF;
  
  -- Sempre dispara
  IF p_cooldown_hours = 0 THEN
    RETURN TRUE;
  END IF;
  
  -- Busca último disparo
  SELECT responded_at INTO last_response
  FROM public.auto_reply_log
  WHERE rule_id = p_rule_id AND chat_id = p_chat_id
  ORDER BY responded_at DESC
  LIMIT 1;
  
  -- Nunca disparou → pode disparar
  IF last_response IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Verifica cooldown
  RETURN (now() - last_response) > (p_cooldown_hours || ' hours')::INTERVAL;
END;
$$;

COMMENT ON FUNCTION public.check_auto_reply_cooldown IS 'Verifica se uma regra pode disparar em um chat. Respeita cooldown e one-shot.';


-- ============================================================
-- 5. FUNÇÃO: get_auto_reply_stats
-- Retorna estatísticas agregadas por regra para o dashboard.
-- Filtrado por account_id (cada criadora vê só seus dados).
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_auto_reply_stats(p_account_id UUID)
RETURNS TABLE(
  rule_id UUID,
  rule_name TEXT,
  total_triggers BIGINT,
  unique_chats BIGINT,
  last_triggered_at TIMESTAMPTZ,
  triggers_today BIGINT,
  triggers_this_week BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id AS rule_id,
    r.name AS rule_name,
    COUNT(l.id) AS total_triggers,
    COUNT(DISTINCT l.chat_id) AS unique_chats,
    MAX(l.responded_at) AS last_triggered_at,
    COUNT(l.id) FILTER (WHERE l.responded_at >= CURRENT_DATE) AS triggers_today,
    COUNT(l.id) FILTER (WHERE l.responded_at >= CURRENT_DATE - INTERVAL '7 days') AS triggers_this_week
  FROM public.auto_reply_rules r
  LEFT JOIN public.auto_reply_log l ON l.rule_id = r.id
  WHERE r.account_id = p_account_id
  GROUP BY r.id, r.name
  ORDER BY COUNT(l.id) DESC;
END;
$$;

COMMENT ON FUNCTION public.get_auto_reply_stats IS 'Estatísticas de auto-reply por conta. Retorna total disparos, chats únicos, hoje e semana.';


-- ============================================================
-- 6. VIEW: auto_reply_rules_with_counts
-- View conveniente que junta regras + contagem de mensagens
-- no pool + total de disparos + telefone da sessão.
-- Usada pela UI para exibir a lista de regras.
-- ============================================================
CREATE OR REPLACE VIEW public.auto_reply_rules_with_counts AS
SELECT 
  r.*,
  COALESCE(msg_count.total, 0)::INTEGER AS message_count,
  COALESCE(log_count.total, 0)::INTEGER AS trigger_count,
  ts.phone_number AS session_phone
FROM public.auto_reply_rules r
LEFT JOIN (
  SELECT rule_id, COUNT(*) AS total
  FROM public.auto_reply_messages
  GROUP BY rule_id
) msg_count ON msg_count.rule_id = r.id
LEFT JOIN (
  SELECT rule_id, COUNT(*) AS total
  FROM public.auto_reply_log
  GROUP BY rule_id
) log_count ON log_count.rule_id = r.id
LEFT JOIN public.telegram_sessions ts ON ts.id = r.session_id;


-- ============================================================
-- 7. FUNÇÃO: match_auto_reply_rules
-- Usada pelo backend/worker para encontrar qual regra deve
-- disparar para uma mensagem recebida.
--
-- Retorna a regra de MAIOR PRIORIDADE que:
--   a) Está enabled
--   b) Pertence à account_id da criadora
--   c) session_id IS NULL (global) OU session_id = a sessão atual
--   d) Keywords batem com o texto recebido
--   e) Cooldown ok para aquele chat
--   f) Tem pelo menos 1 mensagem no pool
-- ============================================================
CREATE OR REPLACE FUNCTION public.match_auto_reply_rules(
  p_account_id UUID,
  p_session_id UUID,
  p_chat_id BIGINT,
  p_message_text TEXT
)
RETURNS TABLE(
  rule_id UUID,
  rule_name TEXT,
  match_mode TEXT,
  cooldown_hours INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  msg_lower TEXT;
  msg_words TEXT[];
BEGIN
  msg_lower := lower(trim(p_message_text));
  -- Extrai palavras (remove pontuação, mantém acentos)
  msg_words := string_to_array(
    regexp_replace(msg_lower, '[^a-záàâãéèêíïóôõúüç0-9\s]', '', 'g'),
    ' '
  );
  msg_words := array_remove(msg_words, '');

  RETURN QUERY
  SELECT 
    r.id AS rule_id,
    r.name AS rule_name,
    r.match_mode,
    r.cooldown_hours
  FROM public.auto_reply_rules r
  WHERE r.account_id = p_account_id
    AND r.enabled = true
    -- Sessão: regra global (NULL) ou da sessão específica
    AND (r.session_id IS NULL OR r.session_id = p_session_id)
    -- Tem mensagens no pool
    AND EXISTS (
      SELECT 1 FROM public.auto_reply_messages m WHERE m.rule_id = r.id
    )
    -- Match de keywords
    AND (
      CASE r.match_mode
        WHEN 'any' THEN
          EXISTS (
            SELECT 1 FROM unnest(r.keywords) kw
            WHERE lower(kw) = ANY(msg_words)
          )
        WHEN 'all' THEN
          NOT EXISTS (
            SELECT 1 FROM unnest(r.keywords) kw
            WHERE NOT (lower(kw) = ANY(msg_words))
          )
        WHEN 'contains' THEN
          EXISTS (
            SELECT 1 FROM unnest(r.keywords) kw
            WHERE msg_lower LIKE '%' || lower(kw) || '%'
          )
        WHEN 'exact' THEN
          EXISTS (
            SELECT 1 FROM unnest(r.keywords) kw
            WHERE msg_lower = lower(kw)
          )
        ELSE false
      END
    )
    -- Cooldown ok
    AND public.check_auto_reply_cooldown(r.id, p_chat_id, r.cooldown_hours)
  ORDER BY r.priority DESC
  LIMIT 1;
END;
$$;

COMMENT ON FUNCTION public.match_auto_reply_rules IS 'Encontra a regra que deve disparar para uma mensagem. Retorna no máximo 1 (a de maior prioridade). Respeita sessão, cooldown e pool.';


-- ============================================================
-- 8. FUNÇÃO: pick_random_auto_reply_message
-- Seleciona uma mensagem aleatória do pool de uma regra.
-- ============================================================
CREATE OR REPLACE FUNCTION public.pick_random_auto_reply_message(p_rule_id UUID)
RETURNS TABLE(
  message_id UUID,
  kind TEXT,
  text_content TEXT,
  media_url TEXT,
  parse_mode TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id AS message_id,
    m.kind,
    m.text_content,
    m.media_url,
    m.parse_mode
  FROM public.auto_reply_messages m
  WHERE m.rule_id = p_rule_id
  ORDER BY random()
  LIMIT 1;
END;
$$;

COMMENT ON FUNCTION public.pick_random_auto_reply_message IS 'Seleciona aleatoriamente uma mensagem do pool de uma regra.';