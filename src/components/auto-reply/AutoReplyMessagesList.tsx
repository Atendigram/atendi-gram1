import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MessageSquare,
  Image,
  Mic,
  Volume2,
  Plus,
  Loader2,
  MoreVertical,
  Edit,
  Trash2,
  Shuffle,
  FileText,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import AutoReplyMessageModal from './AutoReplyMessageModal';

interface AutoReplyMessage {
  id: string;
  rule_id: string;
  account_id: string;
  kind: 'text' | 'photo' | 'audio' | 'voice';
  text_content: string | null;
  media_url: string | null;
  parse_mode: string;
  created_at: string;
}

interface AutoReplyMessagesListProps {
  ruleId: string;
  ruleName: string;
  onBack: () => void;
}

const kindConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  text: {
    label: 'Texto',
    icon: <FileText className="h-3.5 w-3.5" />,
    color: 'bg-blue-100 text-blue-800',
  },
  photo: {
    label: 'Foto',
    icon: <Image className="h-3.5 w-3.5" />,
    color: 'bg-emerald-100 text-emerald-800',
  },
  audio: {
    label: 'Áudio',
    icon: <Volume2 className="h-3.5 w-3.5" />,
    color: 'bg-purple-100 text-purple-800',
  },
  voice: {
    label: 'Voz',
    icon: <Mic className="h-3.5 w-3.5" />,
    color: 'bg-orange-100 text-orange-800',
  },
};

const parseModeLabel: Record<string, string> = {
  none: 'Sem formatação',
  html: 'HTML',
  markdown: 'Markdown',
};

const AutoReplyMessagesList: React.FC<AutoReplyMessagesListProps> = ({
  ruleId,
  ruleName,
  onBack,
}) => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<AutoReplyMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<AutoReplyMessage | null>(null);

  useEffect(() => {
    loadMessages();
  }, [ruleId]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('auto_reply_messages')
        .select('*')
        .eq('rule_id', ruleId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err: any) {
      console.error('Erro ao carregar mensagens:', err);
      toast.error('Erro ao carregar mensagens do pool');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingMessage(null);
    setIsModalOpen(true);
  };

  const handleEdit = (msg: AutoReplyMessage) => {
    setEditingMessage(msg);
    setIsModalOpen(true);
  };

  const handleDelete = async (msgId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta mensagem do pool?')) return;

    const original = [...messages];
    setMessages(prev => prev.filter(m => m.id !== msgId));

    try {
      const { error } = await (supabase as any)
        .from('auto_reply_messages')
        .delete()
        .eq('id', msgId);

      if (error) throw error;
      toast.success('Mensagem excluída');
    } catch (err: any) {
      setMessages(original);
      console.error('Erro ao excluir mensagem:', err);
      toast.error('Erro ao excluir mensagem');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingMessage(null);
  };

  const handleSaved = () => {
    setIsModalOpen(false);
    setEditingMessage(null);
    loadMessages();
  };

  const truncateText = (text: string | null, maxLen: number = 120): string => {
    if (!text) return '';
    return text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
  };

  // Detecta variáveis dinâmicas no texto
  const highlightVariables = (text: string | null): React.ReactNode => {
    if (!text) return <span className="text-muted-foreground italic">Sem conteúdo de texto</span>;

    const truncated = truncateText(text, 200);
    const parts = truncated.split(/(\{[^}]+\})/g);

    return (
      <span>
        {parts.map((part, i) =>
          part.match(/^\{[^}]+\}$/) ? (
            <code
              key={i}
              className="bg-primary/10 text-primary px-1 py-0.5 rounded text-xs font-mono"
            >
              {part}
            </code>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0 h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h2 className="font-semibold text-lg truncate">Pool de Mensagens</h2>
            <p className="text-sm text-muted-foreground truncate">
              Regra: <span className="font-medium">{ruleName}</span>
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} size="sm" className="gap-1.5 shrink-0">
          <Plus className="h-4 w-4" />
          Nova Mensagem
        </Button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <Shuffle className="h-4 w-4 mt-0.5 shrink-0" />
        <p>
          Quando esta regra for acionada, uma mensagem será escolhida{' '}
          <strong>aleatoriamente</strong> deste pool. Adicione várias mensagens para variar as
          respostas.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground text-sm">Carregando mensagens...</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && messages.length === 0 && (
        <Card className="p-8 text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
          <h3 className="font-semibold mb-1">Nenhuma mensagem no pool</h3>
          <p className="text-muted-foreground text-sm mb-4 max-w-sm mx-auto">
            Esta regra precisa de pelo menos uma mensagem para poder disparar. Adicione mensagens de
            texto, foto, áudio ou voz.
          </p>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Mensagem
          </Button>
        </Card>
      )}

      {/* Messages list */}
      {!loading && messages.length > 0 && (
        <div className="space-y-2">
          {messages.map((msg, idx) => {
            const cfg = kindConfig[msg.kind] || kindConfig.text;

            return (
              <Card key={msg.id} className="p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-muted-foreground font-mono w-5">
                        #{idx + 1}
                      </span>
                      <Badge className={`text-xs gap-1 ${cfg.color}`}>
                        {cfg.icon}
                        {cfg.label}
                      </Badge>
                      {msg.parse_mode && msg.parse_mode !== 'none' && (
                        <Badge variant="outline" className="text-xs">
                          {parseModeLabel[msg.parse_mode] || msg.parse_mode}
                        </Badge>
                      )}
                    </div>

                    {/* Conteúdo da mensagem */}
                    <div className="text-sm leading-relaxed">
                      {msg.text_content ? (
                        <div className="whitespace-pre-wrap break-words">
                          {highlightVariables(msg.text_content)}
                        </div>
                      ) : null}
                      {msg.media_url && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          {msg.kind === 'photo' ? (
                            <Image className="h-3 w-3" />
                          ) : (
                            <Volume2 className="h-3 w-3" />
                          )}
                          <span className="truncate">{msg.media_url}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(msg)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDelete(msg.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <AutoReplyMessageModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSaved={handleSaved}
          ruleId={ruleId}
          editingMessage={editingMessage}
        />
      )}
    </div>
  );
};

export default AutoReplyMessagesList;