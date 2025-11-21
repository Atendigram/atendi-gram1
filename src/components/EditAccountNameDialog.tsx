import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { AvatarUpload } from './AvatarUpload';
import { Separator } from '@/components/ui/separator';

interface EditAccountNameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const accountNameSchema = z.object({
  name: z.string()
    .trim()
    .min(1, { message: "O nome não pode estar vazio" })
    .max(100, { message: "O nome deve ter no máximo 100 caracteres" })
});

export const EditAccountNameDialog = ({ open, onOpenChange }: EditAccountNameDialogProps) => {
  const { profile, loadAccountData } = useAuth();
  const [name, setName] = useState(profile?.account_name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validação client-side
    const validation = accountNameSchema.safeParse({ name });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('🔄 Iniciando atualização do nome da conta...');
      
      // Buscar account_id do perfil
      const { data: { user } } = await supabase.auth.getUser();
      console.log('👤 User ID:', user?.id);
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('account_id')
        .eq('id', user.id)
        .single();

      console.log('📋 Profile data:', profileData);
      console.log('📋 Profile error:', profileError);

      if (!profileData?.account_id) {
        throw new Error('Conta não encontrada');
      }

      console.log('🏢 Account ID:', profileData.account_id);
      console.log('📝 Novo nome:', validation.data.name);

      // Atualizar o nome da conta usando owner_id (para RLS)
      const { data: updateData, error: updateError } = await supabase
        .from('accounts')
        .update({ name: validation.data.name })
        .eq('id', profileData.account_id)
        .eq('owner_id', user.id)
        .select();

      console.log('✅ Update data:', updateData);
      console.log('❌ Update error:', updateError);

      if (updateError) throw updateError;

      // Recarregar os dados do perfil
      await loadAccountData();

      toast({
        title: 'Nome atualizado',
        description: 'O nome da conta foi atualizado com sucesso.',
      });

      onOpenChange(false);
    } catch (err) {
      console.error('Erro ao atualizar nome da conta:', err);
      setError('Erro ao atualizar o nome da conta. Tente novamente.');
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o nome da conta.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = () => {
    if (profile?.account_name) {
      return profile.account_name.substring(0, 2).toUpperCase();
    }
    if (profile?.email) {
      return profile.email.substring(0, 2).toUpperCase();
    }
    return 'AD';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar perfil da conta</DialogTitle>
          <DialogDescription>
            Personalize o nome e a foto da sua conta.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {profile?.account_id && (
            <>
              <div className="mb-6">
                <AvatarUpload
                  currentAvatarUrl={profile.avatar_url}
                  accountId={profile.account_id}
                  initials={getInitials()}
                  onAvatarUpdate={() => {}}
                />
              </div>
              
              <Separator className="my-6" />
            </>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome da conta</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError(null);
                  }}
                  placeholder="Digite o nome da conta"
                  maxLength={100}
                  disabled={isSubmitting}
                />
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
