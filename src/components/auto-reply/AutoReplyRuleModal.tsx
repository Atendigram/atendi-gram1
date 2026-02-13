import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, X, Plus, Info } from 'lucide-react';
import { toast } from 'sonner';

interface TelegramSession {
  id: string;
  phone_number: string;
  status: string;
}

interface AutoReplyRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  editingRuleId: string | null;
}

const COOLDOWN_OPTIONS = [
  { value: 'null', label: 'Uma vez por chat (nunca repete)' },
  { value: '0', label: 'Sempre dispara (sem limite)' },
  { value: '1', label: 'A cada 1 hora' },
  { value: '6', label: 'A cada 6 horas' },
  { value: '12', label: 'A cada 12 horas' },
  { value: '24', label: 'A cada 24 horas (1 dia)' },
  { value: '72', label: 'A cada 3 dias' },
  { value: '168', label: 'A cada 7 dias' },
];

const MATCH_MODE_OPTIONS = [
  {
    value: 'any',
    label: 'Qualquer palavra',
    description: 'Dispara se a mensagem contém QUALQUER keyword como palavra isolada',
  },
  {
    value: 'all',
    label: 'Todas as palavras',
    description: 'Dispara se a mensagem contém TODAS as keywords como palavras isoladas',
  },
  {
    value: 'contains',
    label: 'Contém (substring)',
    description: 'Dispara se a keyword aparece como substring (ex: "oi" dispara em "oitocentos")',
  },
  {
    value: 'exact',
    label: 'Exato',
    description: 'Dispara apenas se a mensagem inteira é igual a uma keyword',
  },
];

const AutoReplyRuleModal: React.FC<AutoReplyRuleModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  editingRuleId,
}) => {
  const { profile } = useAuth();
  const isEditing = !!editingRuleId;

  const [loading, setLoading] = useState(false);
  const [loadingRule, setLoadingRule] = useState(false);
  const [sessions, setSessions] = useState<TelegramSession[]>([]);

  // Form state
  const [name, setName] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [matchMode, setMatchMode] = useState('any');
  const [enabled, setEnabled] = useState(true);
  const [cooldownHours, setCooldownHours] = useState<string>('null');
  const [priority, setPriority] = useState(0);
  const [sessionId, setSessionId] = useState<string>('all');

  // Carregar sessões Telegram da conta
  useEffect(() => {
    if (!profile?.account_id) return;
    loadSessions();
  }, [profile?.account_id]);

  // Carregar regra existente para edição
  useEffect(() => {
    if (editingRuleId && isOpen) {
      loadRule(editingRuleId);
    } else {
      resetForm();
    }
  }, [editingRuleId, isOpen]);

  const loadSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('telegram_sessions')
        .select('id, phone_number, status')
        .eq('owner_id', profile!.account_id!)
        .eq('status', 'connected');

      if (error) throw error;
      setSessions(data || []);
    } catch (err) {
      console.error('Erro ao carregar sessões:', err);
    }
  };

  const loadRule = async (ruleId: string) => {
    setLoadingRule(true);
    try {
      const { data, error } = await (supabase as any)
        .from('auto_reply_rules')
        .select('*')
        .eq('id', ruleId)
        .single();

      if (error) throw error;
      if (data) {
        setName(data.name);
        setKeywords(data.keywords || []);
        setMatchMode(data.match_mode);
        setEnabled(data.enabled);
        setCooldownHours(data.cooldown_hours === null ? 'null' : String(data.cooldown_hours));
        setPriority(data.priority);
        setSessionId(data.session_id || 'all');
      }
    } catch (err: any) {
      console.error('Erro ao carregar regra:', err);
      toast.error('Erro ao carregar regra');
      onClose();
    } finally {
      setLoadingRule(false);
    }
  };

  const resetForm = () => {
    setName('');
    setKeywords([]);
    setKeywordInput('');
    setMatchMode('any');
    setEnabled(true);
    setCooldownHours('null');
    setPriority(0);
    setSessionId('all');
  };

  const addKeyword = () => {
    const trimmed = keywordInput.trim().toLowerCase();
    if (!trimmed) return;
    if (keywords.includes(trimmed)) {
      toast.error('Essa palavra-chave já foi adicionada');
      return;
    }
    setKeywords(prev => [...prev, trimmed]);
    setKeywordInput('');
  };

  const removeKeyword = (kw: string) => {
    setKeywords(prev => prev.filter(k => k !== kw));
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  const handleSave = async () => {
    if (!profile?.account_id) {
      toast.error('Conta não encontrada');
      return;
    }

    if (!name.trim()) {
      toast.error('O nome da regra é obrigatório');
      return;
    }

    if (keywords.length === 0) {
      toast.error('Adicione pelo menos uma palavra-chave');
      return;
    }

    setLoading(true);

    const parsedCooldown = cooldownHours === 'null' ? null : parseInt(cooldownHours, 10);
    const parsedSessionId = sessionId === 'all' ? null : sessionId;

    const ruleData = {
      name: name.trim(),
      keywords,
      match_mode: matchMode,
      enabled,
      cooldown_hours: parsedCooldown,
      priority,
      session_id: parsedSessionId,
      updated_at: new Date().toISOString(),
    };

    try {
      if (isEditing) {
        const { error } = await (supabase as any)
          .from('auto_reply_rules')
          .update(ruleData)
          .eq('id', editingRuleId);

        if (error) throw error;
        toast.success('Regra atualizada com sucesso');
      } else {
        const { error } = await (supabase as any)
          .from('auto_reply_rules')
          .insert({
            ...ruleData,
            account_id: profile.account_id,
          });

        if (error) throw error;
        toast.success('Regra criada com sucesso');
      }

      onSaved();
    } catch (err: any) {
      console.error('Erro ao salvar regra:', err);
      toast.error(err.message || 'Erro ao salvar regra');
    } finally {
      setLoading(false);
    }
  };

  const selectedMatchMode = MATCH_MODE_OPTIONS.find(m => m.value === matchMode);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Regra' : 'Nova Regra de Auto-Reply'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize as configurações desta regra de resposta automática.'
              : 'Configure uma regra para responder automaticamente com base em palavras-chave.'}
          </DialogDescription>
        </DialogHeader>

        {loadingRule ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-5 py-2">
            {/* Nome da regra */}
            <div className="space-y-2">
              <Label htmlFor="rule-name">Nome da Regra *</Label>
              <Input
                id="rule-name"
                placeholder="Ex: Resposta sobre preço"
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Palavras-chave */}
            <div className="space-y-2">
              <Label>Palavras-chave *</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Digite uma palavra-chave e pressione Enter"
                  value={keywordInput}
                  onChange={e => setKeywordInput(e.target.value)}
                  onKeyDown={handleKeywordKeyDown}
                  disabled={loading}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addKeyword}
                  disabled={loading || !keywordInput.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {keywords.map(kw => (
                    <Badge key={kw} variant="secondary" className="text-sm px-2 py-1 gap-1">
                      {kw}
                      <button
                        onClick={() => removeKeyword(kw)}
                        className="ml-1 hover:text-destructive transition-colors"
                        type="button"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              {keywords.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Adicione palavras-chave que acionarão esta regra
                </p>
              )}
            </div>

            {/* Modo de correspondência */}
            <div className="space-y-2">
              <Label>Modo de Correspondência</Label>
              <Select value={matchMode} onValueChange={setMatchMode} disabled={loading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MATCH_MODE_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedMatchMode && (
                <p className="text-xs text-muted-foreground flex items-start gap-1">
                  <Info className="h-3 w-3 mt-0.5 shrink-0" />
                  {selectedMatchMode.description}
                </p>
              )}
            </div>

            {/* Grid: Prioridade + Cooldown */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Input
                  id="priority"
                  type="number"
                  min={0}
                  max={999}
                  value={priority}
                  onChange={e => setPriority(parseInt(e.target.value, 10) || 0)}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">Maior = mais prioritário</p>
              </div>

              <div className="space-y-2">
                <Label>Cooldown</Label>
                <Select value={cooldownHours} onValueChange={setCooldownHours} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COOLDOWN_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sessão Telegram */}
            <div className="space-y-2">
              <Label>Sessão Telegram</Label>
              <Select value={sessionId} onValueChange={setSessionId} disabled={loading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as sessões</SelectItem>
                  {sessions.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.phone_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Escolha "Todas" para aplicar a regra em todas as sessões, ou selecione uma sessão específica.
              </p>
            </div>

            {/* Ativa/inativa */}
            <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
              <div>
                <Label className="text-sm font-medium">Regra ativa</Label>
                <p className="text-xs text-muted-foreground">
                  {enabled ? 'A regra está ativa e irá disparar' : 'A regra está desativada'}
                </p>
              </div>
              <Switch checked={enabled} onCheckedChange={setEnabled} disabled={loading} />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading || loadingRule}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEditing ? 'Salvar Alterações' : 'Criar Regra'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AutoReplyRuleModal;