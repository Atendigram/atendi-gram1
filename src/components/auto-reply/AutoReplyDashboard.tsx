import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  MessageSquare,
  Users,
  Clock,
  TrendingUp,
  Loader2,
  RefreshCw,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface RuleStat {
  rule_id: string;
  rule_name: string;
  total_triggers: number;
  unique_chats: number;
  last_triggered_at: string | null;
  triggers_today: number;
  triggers_this_week: number;
}

const AutoReplyDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState<RuleStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.account_id) {
      loadStats();
    }
  }, [profile?.account_id]);

  const loadStats = async () => {
    if (!profile?.account_id) return;
    setLoading(true);

    try {
      const { data, error } = await (supabase as any).rpc('get_auto_reply_stats', {
        p_account_id: profile.account_id,
      });

      if (error) throw error;
      setStats(data || []);
    } catch (err: any) {
      console.error('Erro ao carregar estatísticas:', err);
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  // Totais agregados
  const totalTriggers = stats.reduce((sum, s) => sum + (s.total_triggers || 0), 0);
  const totalUniqueChats = stats.reduce((sum, s) => sum + (s.unique_chats || 0), 0);
  const totalToday = stats.reduce((sum, s) => sum + (s.triggers_today || 0), 0);
  const totalThisWeek = stats.reduce((sum, s) => sum + (s.triggers_this_week || 0), 0);
  const activeRules = stats.filter(s => s.total_triggers > 0).length;

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'Nunca';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'Agora mesmo';
    if (diffMin < 60) return `${diffMin}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Carregando estatísticas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Botão de refresh */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={loadStats} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          Atualizar
        </Button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalTriggers}</p>
                <p className="text-xs text-muted-foreground">Total de disparos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalUniqueChats}</p>
                <p className="text-xs text-muted-foreground">Chats únicos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalToday}</p>
                <p className="text-xs text-muted-foreground">Disparos hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-purple-700" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalThisWeek}</p>
                <p className="text-xs text-muted-foreground">Últimos 7 dias</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela por regra */}
      {stats.length === 0 ? (
        <Card className="p-8 text-center">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
          <h3 className="font-semibold mb-1">Sem dados ainda</h3>
          <p className="text-muted-foreground text-sm">
            As estatísticas aparecerão aqui quando suas regras começarem a disparar.
          </p>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Desempenho por Regra
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left p-3 font-medium">Regra</th>
                    <th className="text-center p-3 font-medium">Total</th>
                    <th className="text-center p-3 font-medium">Chats</th>
                    <th className="text-center p-3 font-medium">Hoje</th>
                    <th className="text-center p-3 font-medium">7 dias</th>
                    <th className="text-center p-3 font-medium">Último disparo</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map(stat => (
                    <tr key={stat.rule_id} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="p-3 font-medium">{stat.rule_name}</td>
                      <td className="p-3 text-center">
                        <Badge variant="secondary">{stat.total_triggers}</Badge>
                      </td>
                      <td className="p-3 text-center text-muted-foreground">
                        {stat.unique_chats}
                      </td>
                      <td className="p-3 text-center">
                        {stat.triggers_today > 0 ? (
                          <Badge className="bg-green-100 text-green-800">
                            {stat.triggers_today}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </td>
                      <td className="p-3 text-center text-muted-foreground">
                        {stat.triggers_this_week}
                      </td>
                      <td className="p-3 text-center">
                        <span className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(stat.last_triggered_at)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AutoReplyDashboard;