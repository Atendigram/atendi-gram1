import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// ──────────────────────────── Types ────────────────────────────

export interface AutoReplyRule {
  id: string;
  account_id: string;
  session_id: string | null;
  name: string;
  keywords: string[];
  match_mode: 'contains' | 'exact' | 'any' | 'all';
  enabled: boolean;
  cooldown_hours: number | null;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface AutoReplyRuleWithCounts extends AutoReplyRule {
  message_count: number;
  trigger_count: number;
  session_phone: string | null;
}

export interface AutoReplyMessage {
  id: string;
  rule_id: string;
  account_id: string;
  kind: 'text' | 'photo' | 'audio' | 'voice';
  text_content: string | null;
  media_url: string | null;
  parse_mode: 'none' | 'html' | 'markdown';
  created_at: string;
}

export interface AutoReplyLogEntry {
  id: string;
  rule_id: string;
  account_id: string;
  session_id: string | null;
  chat_id: number;
  message_id_trigger: number | null;
  message_id_sent: number | null;
  trigger_text: string | null;
  response_message_id: string | null;
  responded_at: string;
}

export interface AutoReplyStat {
  rule_id: string;
  rule_name: string;
  total_triggers: number;
  unique_chats: number;
  last_triggered_at: string | null;
  triggers_today: number;
  triggers_this_week: number;
}

export interface CreateRulePayload {
  name: string;
  keywords: string[];
  match_mode: string;
  enabled: boolean;
  cooldown_hours: number | null;
  priority: number;
  session_id: string | null;
}

export interface UpdateRulePayload extends Partial<CreateRulePayload> {}

export interface CreateMessagePayload {
  rule_id: string;
  kind: string;
  text_content: string | null;
  media_url: string | null;
  parse_mode: string;
}

export interface UpdateMessagePayload extends Partial<Omit<CreateMessagePayload, 'rule_id'>> {}

// ──────────────────────────── Hook ────────────────────────────

const useAutoReply = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);

  const accountId = profile?.account_id;

  // ───────── RULES ─────────

  const fetchRules = useCallback(async (): Promise<AutoReplyRuleWithCounts[]> => {
    if (!accountId) return [];
    try {
      const { data, error } = await (supabase as any)
        .from('auto_reply_rules_with_counts')
        .select('*')
        .eq('account_id', accountId)
        .order('priority', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err: any) {
      console.error('fetchRules error:', err);
      toast.error('Erro ao carregar regras');
      return [];
    }
  }, [accountId]);

  const fetchRule = useCallback(async (ruleId: string): Promise<AutoReplyRule | null> => {
    try {
      const { data, error } = await (supabase as any)
        .from('auto_reply_rules')
        .select('*')
        .eq('id', ruleId)
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error('fetchRule error:', err);
      toast.error('Erro ao carregar regra');
      return null;
    }
  }, []);

  const createRule = useCallback(
    async (payload: CreateRulePayload): Promise<AutoReplyRule | null> => {
      if (!accountId) {
        toast.error('Conta não encontrada');
        return null;
      }
      setLoading(true);
      try {
        const { data, error } = await (supabase as any)
          .from('auto_reply_rules')
          .insert({ ...payload, account_id: accountId })
          .select()
          .single();

        if (error) throw error;
        toast.success('Regra criada com sucesso');
        return data;
      } catch (err: any) {
        console.error('createRule error:', err);
        toast.error(err.message || 'Erro ao criar regra');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [accountId]
  );

  const updateRule = useCallback(
    async (ruleId: string, payload: UpdateRulePayload): Promise<boolean> => {
      setLoading(true);
      try {
        const { error } = await (supabase as any)
          .from('auto_reply_rules')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', ruleId);

        if (error) throw error;
        toast.success('Regra atualizada');
        return true;
      } catch (err: any) {
        console.error('updateRule error:', err);
        toast.error(err.message || 'Erro ao atualizar regra');
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteRule = useCallback(async (ruleId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { error } = await (supabase as any)
        .from('auto_reply_rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;
      toast.success('Regra excluída');
      return true;
    } catch (err: any) {
      console.error('deleteRule error:', err);
      toast.error(err.message || 'Erro ao excluir regra');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleRuleEnabled = useCallback(
    async (ruleId: string, currentEnabled: boolean): Promise<boolean> => {
      try {
        const { error } = await (supabase as any)
          .from('auto_reply_rules')
          .update({ enabled: !currentEnabled, updated_at: new Date().toISOString() })
          .eq('id', ruleId);

        if (error) throw error;
        toast.success(currentEnabled ? 'Regra desativada' : 'Regra ativada');
        return true;
      } catch (err: any) {
        console.error('toggleRuleEnabled error:', err);
        toast.error('Erro ao alterar status');
        return false;
      }
    },
    []
  );

  // ───────── MESSAGES ─────────

  const fetchMessages = useCallback(
    async (ruleId: string): Promise<AutoReplyMessage[]> => {
      try {
        const { data, error } = await (supabase as any)
          .from('auto_reply_messages')
          .select('*')
          .eq('rule_id', ruleId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];
      } catch (err: any) {
        console.error('fetchMessages error:', err);
        toast.error('Erro ao carregar mensagens');
        return [];
      }
    },
    []
  );

  const createMessage = useCallback(
    async (payload: CreateMessagePayload): Promise<AutoReplyMessage | null> => {
      if (!accountId) {
        toast.error('Conta não encontrada');
        return null;
      }
      setLoading(true);
      try {
        const { data, error } = await (supabase as any)
          .from('auto_reply_messages')
          .insert({ ...payload, account_id: accountId })
          .select()
          .single();

        if (error) throw error;
        toast.success('Mensagem adicionada ao pool');
        return data;
      } catch (err: any) {
        console.error('createMessage error:', err);
        toast.error(err.message || 'Erro ao criar mensagem');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [accountId]
  );

  const updateMessage = useCallback(
    async (messageId: string, payload: UpdateMessagePayload): Promise<boolean> => {
      setLoading(true);
      try {
        const { error } = await (supabase as any)
          .from('auto_reply_messages')
          .update(payload)
          .eq('id', messageId);

        if (error) throw error;
        toast.success('Mensagem atualizada');
        return true;
      } catch (err: any) {
        console.error('updateMessage error:', err);
        toast.error(err.message || 'Erro ao atualizar mensagem');
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteMessage = useCallback(async (messageId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { error } = await (supabase as any)
        .from('auto_reply_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
      toast.success('Mensagem excluída');
      return true;
    } catch (err: any) {
      console.error('deleteMessage error:', err);
      toast.error(err.message || 'Erro ao excluir mensagem');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // ───────── STATS ─────────

  const fetchStats = useCallback(async (): Promise<AutoReplyStat[]> => {
    if (!accountId) return [];
    try {
      const { data, error } = await (supabase as any).rpc('get_auto_reply_stats', {
        p_account_id: accountId,
      });

      if (error) throw error;
      return data || [];
    } catch (err: any) {
      console.error('fetchStats error:', err);
      toast.error('Erro ao carregar estatísticas');
      return [];
    }
  }, [accountId]);

  // ───────── LOGS ─────────

  const fetchLogs = useCallback(
    async (
      page: number = 0,
      pageSize: number = 20
    ): Promise<{ data: AutoReplyLogEntry[]; count: number }> => {
      if (!accountId) return { data: [], count: 0 };
      try {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        const { data, error, count } = await (supabase as any)
          .from('auto_reply_log')
          .select('*', { count: 'exact' })
          .eq('account_id', accountId)
          .order('responded_at', { ascending: false })
          .range(from, to);

        if (error) throw error;
        return { data: data || [], count: count || 0 };
      } catch (err: any) {
        console.error('fetchLogs error:', err);
        toast.error('Erro ao carregar logs');
        return { data: [], count: 0 };
      }
    },
    [accountId]
  );

  return {
    loading,
    // Rules
    fetchRules,
    fetchRule,
    createRule,
    updateRule,
    deleteRule,
    toggleRuleEnabled,
    // Messages
    fetchMessages,
    createMessage,
    updateMessage,
    deleteMessage,
    // Stats & Logs
    fetchStats,
    fetchLogs,
  };
};

export default useAutoReply;