import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ScrollText,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Clock,
  Hash,
  Phone,
} from 'lucide-react';
import { toast } from 'sonner';

interface LogEntry {
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
  // joined
  rule_name?: string;
  session_phone?: string;
}

const PAGE_SIZE = 20;

const AutoReplyLogTable: React.FC = () => {
  const { profile } = useAuth();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (profile?.account_id) {
      loadLogs();
    }
  }, [profile?.account_id, page]);

  const loadLogs = async () => {
    if (!profile?.account_id) return;
    setLoading(true);

    try {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // Buscar logs com nome da regra
      const { data, error, count } = await (supabase as any)
        .from('auto_reply_log')
        .select(
          `
          id,
          rule_id,
          account_id,
          session_id,
          chat_id,
          message_id_trigger,
          message_id_sent,
          trigger_text,
          response_message_id,
          responded_at,
          auto_reply_rules!inner(name),
          telegram_sessions(phone_number)
        `,
          { count: 'exact' }
        )
        .eq('account_id', profile.account_id)
        .order('responded_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      const mapped = (data || []).map((entry: any) => ({
        ...entry,
        rule_name: entry.auto_reply_rules?.name || 'Regra removida',
        session_phone: entry.telegram_sessions?.phone_number || null,
      }));

      setLogs(mapped);
      setTotalCount(count || 0);
    } catch (err: any) {
      console.error('Erro ao carregar logs:', err);
      toast.error('Erro ao carregar logs de disparo');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncate = (text: string | null, max: number = 60): string => {
    if (!text) return '—';
    return text.length > max ? text.substring(0, max) + '...' : text;
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Carregando logs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {totalCount} registro{totalCount !== 1 ? 's' : ''} encontrado{totalCount !== 1 ? 's' : ''}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setPage(0);
            loadLogs();
          }}
          className="gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Empty state */}
      {totalCount === 0 && !loading && (
        <Card className="p-8 text-center">
          <ScrollText className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
          <h3 className="font-semibold mb-1">Nenhum log registrado</h3>
          <p className="text-muted-foreground text-sm">
            Os logs aparecerão aqui quando suas regras de auto-reply dispararem.
          </p>
        </Card>
      )}

      {/* Table */}
      {totalCount > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left p-3 font-medium">Data/Hora</th>
                    <th className="text-left p-3 font-medium">Regra</th>
                    <th className="text-left p-3 font-medium">Chat ID</th>
                    <th className="text-left p-3 font-medium">Texto que acionou</th>
                    <th className="text-center p-3 font-medium">Sessão</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr
                      key={log.id}
                      className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="p-3 whitespace-nowrap">
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDate(log.responded_at)}
                        </span>
                      </td>
                      <td className="p-3">
                        <Badge variant="secondary" className="text-xs font-medium">
                          {log.rule_name}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <span className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
                          <Hash className="h-3 w-3" />
                          {log.chat_id}
                        </span>
                      </td>
                      <td className="p-3 max-w-[250px]">
                        <p className="text-xs text-muted-foreground truncate" title={log.trigger_text || undefined}>
                          {truncate(log.trigger_text)}
                        </p>
                      </td>
                      <td className="p-3 text-center">
                        {log.session_phone ? (
                          <span className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {log.session_phone}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-3 border-t">
                <p className="text-xs text-muted-foreground">
                  Página {page + 1} de {totalPages}
                </p>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    disabled={page === 0 || loading}
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    disabled={page >= totalPages - 1 || loading}
                    onClick={() => setPage(p => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AutoReplyLogTable;