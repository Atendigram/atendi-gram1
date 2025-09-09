import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Upload, X, AlertCircle } from 'lucide-react';

interface WelcomeStep {
  id: string;
  flow_id: string;
  order_index: number;
  kind: 'text' | 'photo' | 'voice' | 'audio';
  text_content?: string;
  parse_mode?: 'none' | 'html' | 'markdown';
  media_url?: string;
  delay_after_sec: number;
}

interface WelcomeStepModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (step: Partial<WelcomeStep>) => void;
  editingStep?: WelcomeStep | null;
}

const WelcomeStepModal: React.FC<WelcomeStepModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingStep,
}) => {
  const [formData, setFormData] = useState<{
    kind: 'text' | 'photo' | 'voice' | 'audio';
    text_content: string;
    parse_mode: 'none' | 'html' | 'markdown';
    delay_after_sec: number;
    media_url: string;
  }>({
    kind: 'text',
    text_content: '',
    parse_mode: 'none',
    delay_after_sec: 0,
    media_url: '',
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (editingStep) {
      setFormData({
        kind: editingStep.kind,
        text_content: editingStep.text_content || '',
        parse_mode: editingStep.parse_mode || 'none',
        delay_after_sec: editingStep.delay_after_sec,
        media_url: editingStep.media_url || '',
      });
    } else {
      setFormData({
        kind: 'text',
        text_content: '',
        parse_mode: 'none',
        delay_after_sec: 0,
        media_url: '',
      });
    }
    validateForm();
  }, [editingStep]);

  useEffect(() => {
    validateForm();
  }, [formData]);

  const validateForm = () => {
    const errors: string[] = [];

    // kind is always required (handled by select component)
    
    // text_content required for text type
    if (formData.kind === 'text' && !formData.text_content.trim()) {
      errors.push('Conteúdo do texto é obrigatório para mensagens de texto');
    }

    // media_url required for media types
    if (['photo', 'voice', 'audio'].includes(formData.kind) && !formData.media_url) {
      errors.push('Arquivo de mídia é obrigatório para este tipo de passo');
    }

    // delay_after_sec validation
    if (formData.delay_after_sec < 0) {
      errors.push('Delay deve ser maior ou igual a 0');
    }

    setValidationErrors(errors);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Get user's account_id for folder structure
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Usuário não autenticado');
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('account_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('Não foi possível carregar o perfil do usuário');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${profile.account_id}/${fileName}`;

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const { error: uploadError } = await supabase.storage
        .from('welcome-media')
        .upload(filePath, file, {
          upsert: true,
        });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('welcome-media')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, media_url: publicUrl }));
      toast({
        title: 'Upload realizado',
        description: 'Arquivo enviado com sucesso.',
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        variant: 'destructive',
        title: 'Erro no upload',
        description: error instanceof Error ? error.message : 'Não foi possível enviar o arquivo.',
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSave = async () => {
    if (validationErrors.length > 0) {
      toast({
        variant: 'destructive',
        title: 'Validação falhou',
        description: 'Por favor, corrija os erros antes de salvar.',
      });
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving step:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o passo.',
      });
    } finally {
      setSaving(false);
    }
  };

  const requiresMedia = ['photo', 'voice', 'audio'].includes(formData.kind);
  const isFormValid = validationErrors.length === 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {editingStep ? 'Editar Passo' : 'Criar Novo Passo'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {validationErrors.length > 0 && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-destructive">Erros de validação:</p>
                  <ul className="text-sm text-destructive space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="kind">Tipo do Passo</Label>
            <Select
              value={formData.kind}
              onValueChange={(value: 'text' | 'photo' | 'voice' | 'audio') =>
                setFormData(prev => ({ ...prev, kind: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Texto</SelectItem>
                <SelectItem value="photo">Foto</SelectItem>
                <SelectItem value="voice">Voz</SelectItem>
                <SelectItem value="audio">Áudio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="text_content">
              Conteúdo do Texto
              {requiresMedia && ' (Legenda/Descrição)'}
            </Label>
            <Textarea
              id="text_content"
              placeholder="Digite o texto ou use placeholders: {first_name}, {username}, {today}"
              value={formData.text_content}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, text_content: e.target.value }))
              }
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Placeholders disponíveis: {'{first_name}, {username}, {today}'}
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="parse_mode">Modo de Parse</Label>
            <Select
              value={formData.parse_mode}
              onValueChange={(value: 'none' | 'html' | 'markdown') =>
                setFormData(prev => ({ ...prev, parse_mode: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="markdown">Markdown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {requiresMedia && (
            <div className="grid gap-2">
              <Label htmlFor="media">Arquivo de Mídia</Label>
              <div className="space-y-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        id="media"
                        type="file"
                        accept={
                          formData.kind === 'photo'
                            ? 'image/*'
                            : formData.kind === 'voice' || formData.kind === 'audio'
                            ? 'audio/*'
                            : '*/*'
                        }
                        onChange={handleFileUpload}
                        disabled={uploading}
                      />
                      {uploading && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Upload className="h-4 w-4 animate-pulse" />
                          Enviando...
                        </div>
                      )}
                    </div>
                    {uploading && uploadProgress > 0 && (
                      <Progress value={uploadProgress} className="w-full" />
                    )}
                  </div>
                {formData.media_url && (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <span className="text-sm truncate flex-1">{formData.media_url}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setFormData(prev => ({ ...prev, media_url: '' }))
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="delay">Delay Após Envio (segundos)</Label>
            <Input
              id="delay"
              type="number"
              min="0"
              placeholder="0"
              value={formData.delay_after_sec}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  delay_after_sec: parseInt(e.target.value) || 0,
                }))
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving || uploading || !isFormValid}
          >
            {saving ? 'Salvando...' : editingStep ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeStepModal;