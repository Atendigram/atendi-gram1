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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, FileText, Image, Mic, Volume2, Info } from 'lucide-react';
import { toast } from 'sonner';

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

interface AutoReplyMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  ruleId: string;
  editingMessage: AutoReplyMessage | null;
}

const KIND_OPTIONS = [
  { value: 'text', label: 'Texto', icon: <FileText className="h-4 w-4" />, description: 'Mensagem de texto simples' },
  { value: 'photo', label: 'Foto', icon: <Image className="h-4 w-4" />, description: 'Imagem com legenda opcional' },
  { value: 'audio', label: 'Áudio', icon: <Volume2 className="h-4 w-4" />, description: 'Arquivo de áudio (MP3, OGG)' },
  { value: 'voice', label: 'Voz', icon: <Mic className="h-4 w-4" />, description: 'Mensagem de voz (OGG Opus)' },
];

const PARSE_MODE_OPTIONS = [
  { value: 'none', label: 'Sem formatação' },
  { value: 'html', label: 'HTML' },
  { value: 'markdown', label: 'Markdown' },
];

const VARIABLE_HINTS = [
  { var: '{nome}', desc: 'Nome completo do contato' },
  { var: '{primeiro_nome}', desc: 'Primeiro nome' },
  { var: '{username}', desc: 'Username do Telegram' },
  { var: '{data}', desc: 'Data atual' },
  { var: '{hora}', desc: 'Hora atual' },
];

const AutoReplyMessageModal: React.FC<AutoReplyMessageModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  ruleId,
  editingMessage,
}) => {
  const { profile } = useAuth();
  const isEditing = !!editingMessage;

  const [loading, setLoading] = useState(false);
  const [kind, setKind] = useState<string>('text');
  const [textContent, setTextContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [parseMode, setParseMode] = useState('none');

  useEffect(() => {
    if (editingMessage) {
      setKind(editingMessage.kind);
      setTextContent(editingMessage.text_content || '');
      setMediaUrl(editingMessage.media_url || '');
      setParseMode(editingMessage.parse_mode || 'none');
    } else {
      setKind('text');
      setTextContent('');
      setMediaUrl('');
      setParseMode('none');
    }
  }, [editingMessage, isOpen]);

  const needsMedia = kind === 'photo' || kind === 'audio' || kind === 'voice';
  const needsText = kind === 'text' || kind === 'photo'; // foto pode ter legenda

  const insertVariable = (variable: string) => {
    setTextContent(prev => prev + variable);
  };

  const handleSave = async () => {
    if (!profile?.account_id) {
      toast.error('Conta não encontrada');
      return;
    }

    // Validações
    if (kind === 'text' && !textContent.trim()) {
      toast.error('O conteúdo de texto é obrigatório para mensagens de texto');
      return;
    }

    if (needsMedia && !mediaUrl.trim()) {
      toast.error('A URL de mídia é obrigatória para este tipo de mensagem');
      return;
    }

    setLoading(true);

    const messageData = {
      kind,
      text_content: textContent.trim() || null,
      media_url: mediaUrl.trim() || null,
      parse_mode: parseMode,
    };

    try {
      if (isEditing) {
        const { error } = await (supabase as any)
          .from('auto_reply_messages')
          .update(messageData)
          .eq('id', editingMessage!.id);

        if (error) throw error;
        toast.success('Mensagem atualizada');
      } else {
        const { error } = await (supabase as any)
          .from('auto_reply_messages')
          .insert({
            ...messageData,
            rule_id: ruleId,
            account_id: profile.account_id,
          });

        if (error) throw error;
        toast.success('Mensagem adicionada ao pool');
      }

      onSaved();
    } catch (err: any) {
      console.error('Erro ao salvar mensagem:', err);
      toast.error(err.message || 'Erro ao salvar mensagem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Mensagem' : 'Nova Mensagem no Pool'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize o conteúdo desta mensagem.'
              : 'Adicione uma nova mensagem ao pool de respostas desta regra.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Tipo de mensagem */}
          <div className="space-y-2">
            <Label>Tipo de Mensagem</Label>
            <div className="grid grid-cols-2 gap-2">
              {KIND_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setKind(opt.value)}
                  disabled={loading}
                  className={`flex items-center gap-2.5 p-3 rounded-lg border-2 text-left transition-all ${
                    kind === opt.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/30 hover:bg-muted/40'
                  }`}
                >
                  <span
                    className={`p-1.5 rounded-md ${
                      kind === opt.value ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {opt.icon}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Conteúdo de texto */}
          {(needsText || kind === 'text') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="text-content">
                  {kind === 'photo' ? 'Legenda (opcional)' : 'Conteúdo de Texto *'}
                </Label>
                <span className="text-xs text-muted-foreground">
                  {textContent.length} caracteres
                </span>
              </div>
              <Textarea
                id="text-content"
                placeholder={
                  kind === 'photo'
                    ? 'Legenda da imagem (opcional)...'
                    : 'Digite o conteúdo da mensagem...\nEx: Olá {primeiro_nome}! Nossos preços estão no link abaixo 👇'
                }
                value={textContent}
                onChange={e => setTextContent(e.target.value)}
                disabled={loading}
                rows={5}
                className="resize-y font-mono text-sm"
              />

              {/* Variáveis dinâmicas */}
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Variáveis disponíveis (clique para inserir):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {VARIABLE_HINTS.map(v => (
                    <button
                      key={v.var}
                      type="button"
                      onClick={() => insertVariable(v.var)}
                      disabled={loading}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-muted hover:bg-muted/80 rounded text-xs font-mono transition-colors"
                      title={v.desc}
                    >
                      {v.var}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* URL de mídia */}
          {needsMedia && (
            <div className="space-y-2">
              <Label htmlFor="media-url">URL de Mídia *</Label>
              <Input
                id="media-url"
                placeholder={
                  kind === 'photo'
                    ? 'https://exemplo.com/imagem.jpg'
                    : kind === 'voice'
                    ? 'https://exemplo.com/voz.ogg'
                    : 'https://exemplo.com/audio.mp3'
                }
                value={mediaUrl}
                onChange={e => setMediaUrl(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                {kind === 'photo' && 'Formatos suportados: JPG, PNG, GIF, WebP'}
                {kind === 'audio' && 'Formatos suportados: MP3, OGG, WAV'}
                {kind === 'voice' && 'Formato: OGG com codec Opus (padrão do Telegram)'}
              </p>
            </div>
          )}

          {/* Modo de formatação */}
          {(kind === 'text' || kind === 'photo') && (
            <div className="space-y-2">
              <Label>Formatação do Texto</Label>
              <Select value={parseMode} onValueChange={setParseMode} disabled={loading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PARSE_MODE_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {parseMode === 'html' && (
                <p className="text-xs text-muted-foreground">
                  Tags suportadas: {'<b>'}, {'<i>'}, {'<u>'}, {'<code>'}, {'<a href="...">'}
                </p>
              )}
              {parseMode === 'markdown' && (
                <p className="text-xs text-muted-foreground">
                  Sintaxe: *negrito*, _itálico_, `código`, [link](url)
                </p>
              )}
            </div>
          )}

          {/* Preview simplificado */}
          {textContent.trim() && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Pré-visualização</Label>
              <div className="p-3 bg-[#e5ddd5] rounded-lg">
                <div className="bg-[#dcf8c6] rounded-lg p-3 max-w-[85%] ml-auto shadow-sm">
                  <p className="text-sm whitespace-pre-wrap break-words text-gray-900">
                    {textContent
                      .replace(/\{nome\}/g, 'João Silva')
                      .replace(/\{primeiro_nome\}/g, 'João')
                      .replace(/\{username\}/g, '@joaosilva')
                      .replace(/\{data\}/g, new Date().toLocaleDateString('pt-BR'))
                      .replace(/\{hora\}/g, new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))}
                  </p>
                  <p className="text-[10px] text-gray-500 text-right mt-1">
                    {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} ✓✓
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEditing ? 'Salvar Alterações' : 'Adicionar ao Pool'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AutoReplyMessageModal;