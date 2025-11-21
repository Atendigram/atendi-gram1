import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Upload, Loader2, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  accountId: string;
  initials: string;
  onAvatarUpdate?: () => void;
}

export const AvatarUpload = ({ 
  currentAvatarUrl, 
  accountId, 
  initials,
  onAvatarUpdate 
}: AvatarUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || null);
  const { loadAccountData } = useAuth();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação do arquivo
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O tamanho máximo permitido é 2MB.',
        variant: 'destructive',
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Formato inválido',
        description: 'Por favor, selecione uma imagem.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      // Criar preview local
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);

      // Upload para o Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${accountId}/avatar.${fileExt}`;

      // Deletar avatar antigo se existir
      if (currentAvatarUrl) {
        const oldPath = currentAvatarUrl.split('/').slice(-2).join('/');
        await supabase.storage.from('avatars').remove([oldPath]);
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Atualizar tabela accounts
      const { error: updateError } = await supabase
        .from('accounts')
        .update({ avatar_url: publicUrl })
        .eq('id', accountId);

      if (updateError) throw updateError;

      // Recarregar dados do perfil
      await loadAccountData();

      toast({
        title: 'Avatar atualizado',
        description: 'Sua foto foi atualizada com sucesso.',
      });

      onAvatarUpdate?.();
    } catch (error: any) {
      console.error('Erro ao fazer upload do avatar:', error);
      setPreviewUrl(currentAvatarUrl || null);
      toast({
        title: 'Erro no upload',
        description: 'Não foi possível atualizar o avatar. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!currentAvatarUrl) return;

    setIsUploading(true);

    try {
      // Deletar do storage
      const path = currentAvatarUrl.split('/').slice(-2).join('/');
      await supabase.storage.from('avatars').remove([path]);

      // Atualizar tabela accounts
      const { error: updateError } = await supabase
        .from('accounts')
        .update({ avatar_url: null })
        .eq('id', accountId);

      if (updateError) throw updateError;

      setPreviewUrl(null);
      await loadAccountData();

      toast({
        title: 'Avatar removido',
        description: 'Sua foto foi removida com sucesso.',
      });

      onAvatarUpdate?.();
    } catch (error) {
      console.error('Erro ao remover avatar:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o avatar.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="h-24 w-24">
        <AvatarImage src={previewUrl || undefined} alt="Avatar" />
        <AvatarFallback className="text-xl">{initials}</AvatarFallback>
      </Avatar>
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClick={() => document.getElementById('avatar-upload')?.click()}
        >
          {isUploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          {previewUrl ? 'Trocar foto' : 'Adicionar foto'}
        </Button>
        
        {previewUrl && (
          <Button
            variant="ghost"
            size="sm"
            disabled={isUploading}
            onClick={handleRemoveAvatar}
          >
            <X className="mr-2 h-4 w-4" />
            Remover
          </Button>
        )}
      </div>

      <input
        id="avatar-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        disabled={isUploading}
      />
    </div>
  );
};
