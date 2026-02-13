import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Bot,
  Edit,
  Trash2,
  MoreVertical,
  MessageSquare,
  Zap,
  Clock,
  Plus,
  Loader2,
  Phone,
  ArrowUpDown,
  Hash,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';

interface AutoReplyRule {
  id: string;
  account_id: string;
  session_id: string | null;
  name: string;
  keywords: string[];
  match_mode: string;
  enabled: boolean;
  cooldown_hours: number | null;
  priority: number;
  created_at: string;
  updated_at: string;
  message_count?: number;
  trigger_count?: number;
  session_phone?: string;
}

interface AutoReplyRulesListProps {
  onEditRule: (ruleId: string) => void;
  onCreateRule: () => void;
  refreshKey: number;
  onRefresh: () => void;
}

const matchModeLabels: Record<string, string> = {
  contains: 'Contém',
  exact: 'Exato',
  any: 'Qualquer palavra',
  all: 'Todas as palavras',
};

const matchModeColors: Record<string, string> = {
  contains: 'bg-blue-100 text-blue-800',
  exact: 'bg-purple-100 text-purple-800',
  any: 'bg-green-100 text-green-800',
  all: 'bg-orange-100 text-orange-800',
};

const cooldownLabel = (hours: number | null): string => {
  if (hours === null) return 'Uma vez (nunca repete)';
  if (hours === 0) return 'Sempre dispara';
  if (hours === 1) return 'A cada 1 hora';
  if (hours < 24) return `A cada ${hours} horas`;
  if (hours === 24) return 'A cada 1 dia';
  if (hours === 168) return 'A cada 7 dias';
  return `A cada ${hours}h`;
};

const AutoReplyRulesList: React.FC<AutoReplyRulesListProps> = ({
  onEditRule,
  onCreateRule,
  refreshKey,
  onRefresh,
}) => {
  const { profile } = useAuth();
  const [rules, setRules] = useState<AutoReplyRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.account_id) {
      loadRules();
    }
  }, [profile?.account_id, refreshKey]);

  const loadRules = async () => {
    if (!profile?.account_id) return;
    setLoading(true);

    try {
      // Buscar regras com contagem de mensagens e disparos
      const { data, error } = await (supabase as any)
        .from('auto_reply_rules_with_counts')
        .select('*')
        .eq('account_id', profile.account_id)
        .order('priority', { ascending: false });

      if (error) throw error;
      setRules(data || []);
    } catch (err: any) {
      console.error('Erro ao carregar regras:', err);
      toast.error('Erro ao carregar regras de auto-reply');
    } finally {
      setLoading(false);
    }
  };

  const toggleEnabled = async (ruleId: string, currentEnabled: boolean) => {
    // Optimistic update
    setRules(prev =>
      prev.map(r => (r.id === ruleId ? { ...r, enabled: !currentEnabled } : r))
    );

    try {
      const { error } = await supabase
        .from('auto_reply_rules' as any)
        .update({ enabled: !currentEnabled, updated_at: new Date().toISOString() })
        .eq('id', ruleId);

      if (error) throw error;
      toast.success(currentEnabled ? 'Regra desativada' : 'Regra ativada');
    } catch (err: any) {
      // Rollback
      setRules(prev =>
        prev.map(r => (r.id === ruleId ? { ...r, enabled: currentEnabled } : r))
      );
      console.error('Erro ao alterar status:', err);
      toast.error('Erro ao alterar status da regra');
    }
  };

  const deleteRule = async (ruleId: string, ruleName: string) => {
    if (!confirm(`Tem certeza que deseja excluir a regra "${ruleName}"?\nTodas as mensagens e logs associados também serão removidos.`)) {
      return;
    }

    const originalRules = [...rules];
    setRules(prev => prev.filter(r => r.id !== ruleId));

    try {
      const { error } = await supabase
        .from('auto_reply_rules' as any)
        .delete()
        .eq('id', ruleId);

      if (error) throw error;
      toast.success('Regra excluída com sucesso');
    } catch (err: any) {
      setRules(originalRules);
      console.error('Erro ao excluir regra:', err);
      toast.error('Erro ao excluir regra');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Carregando regras...</span>
      </div>
    );
  }

  if (rules.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Bot className="h-14 w-14 mx-auto text-muted-foreground/40 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhuma regra criada</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Crie sua primeira regra de resposta automática para responder mensagens com
          base em palavras-chave.
        </p>
        <Button onClick={onCreateRule} className="gap-2">
          <Plus className="h-4 w-4" />
          Criar Primeira Regra
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {rules.map((rule) => (
        <Card
          key={rule.id}
          className={`p-4 transition-all hover:shadow-md ${
            !rule.enabled ? 'opacity-60 bg-muted/30' : ''
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            {/* Lado esquerdo: info da regra */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <Switch
                  checked={rule.enabled}
                  onCheckedChange={() => toggleEnabled(rule.id, rule.enabled)}
                />
                <h3 className="font-semibold text-base truncate">{rule.name}</h3>
                <Badge variant="outline" className="text-xs shrink-0">
                  <ArrowUpDown className="h-3 w-3 mr-1" />
                  P{rule.priority}
                </Badge>
                <Badge className={`text-xs shrink-0 ${matchModeColors[rule.match_mode] || 'bg-gray-100 text-gray-800'}`}>
                  {matchModeLabels[rule.match_mode] || rule.match_mode}
                </Badge>
              </div>

              {/* Keywords */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {rule.keywords.map((kw, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="text-xs font-mono px-2 py-0.5"
                  >
                    <Search className="h-3 w-3 mr-1 opacity-50" />
                    {kw}
                  </Badge>
                ))}
                {rule.keywords.length === 0 && (
                  <span className="text-xs text-muted-foreground italic">
                    Sem palavras-chave configuradas
                  </span>
                )}
              </div>

              {/* Metadados */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {rule.message_count ?? 0} mensagen{(rule.message_count ?? 0) !== 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5" />
                  {rule.trigger_count ?? 0} disparo{(rule.trigger_count ?? 0) !== 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {cooldownLabel(rule.cooldown_hours)}
                </span>
                {rule.session_phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    {rule.session_phone}
                  </span>
                )}
              </div>
            </div>

            {/* Lado direito: ações */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEditRule(rule.id)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Regra
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => deleteRule(rule.id, rule.name)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default AutoReplyRulesList;