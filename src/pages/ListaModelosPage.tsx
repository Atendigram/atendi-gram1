import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import PageLayout from '@/components/layout/PageLayout';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Loader2 } from 'lucide-react';

interface ModeloComContatos {
  id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  account_id: string;
  total_contatos: number;
}

const ListaModelosPage = () => {
  const { profile, loading: authLoading } = useAuth();
  const [modelos, setModelos] = useState<ModeloComContatos[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) return;

    const fetchModelos = async () => {
      setLoading(true);
      try {
        // Buscar todos os perfis
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name, email, account_id');

        if (profilesError) throw profilesError;

        // Buscar avatares das contas
        const accountIds = profiles?.map(p => p.account_id).filter(Boolean) || [];
        const { data: accounts, error: accountsError } = await supabase
          .from('accounts')
          .select('id, avatar_url')
          .in('id', accountIds);

        if (accountsError) throw accountsError;

        const accountAvatarMap = new Map(accounts?.map(a => [a.id, a.avatar_url]) || []);

        // Buscar contagem de contatos para cada account_id
        // Usando a tabela contatos_geral que tem todos os contatos
        const modelosComContatos: ModeloComContatos[] = await Promise.all(
          (profiles || []).map(async (p) => {
            // Buscar total de contatos da conta usando função do banco
            const { data: totalData, error: totalError } = await supabase
              .rpc('get_total_contacts', { p_account_id: p.account_id });

            return {
              id: p.id,
              display_name: p.display_name,
              email: p.email,
              avatar_url: accountAvatarMap.get(p.account_id) || null,
              account_id: p.account_id,
              total_contatos: totalError ? 0 : (totalData || 0),
            };
          })
        );

        // Ordenar do maior para o menor número de contatos
        modelosComContatos.sort((a, b) => b.total_contatos - a.total_contatos);
        setModelos(modelosComContatos);
      } catch (error) {
        console.error('Erro ao buscar modelos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchModelos();
  }, [isAdmin]);

  // Aguardar carregamento da autenticação
  if (authLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  // Redirecionar se não for admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <PageLayout>
      <div className="p-6 animate-enter">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Lista de Modelos</h1>
          <p className="text-muted-foreground mt-1">
            Visualize todos os perfis e a quantidade de contatos de cada um
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : modelos.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum modelo encontrado
          </div>
        ) : (
          <div className="space-y-2">
            {modelos.map((modelo, index) => (
              <div 
                key={modelo.id} 
                className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:shadow-md transition-shadow"
              >
                <span className="text-sm font-medium text-muted-foreground w-6">
                  {index + 1}.
                </span>
                <Avatar className="h-12 w-12 flex-shrink-0">
                  <AvatarImage src={modelo.avatar_url || undefined} alt={modelo.display_name || 'Modelo'} />
                  <AvatarFallback className="text-base bg-primary/10 text-primary font-medium">
                    {modelo.display_name
                      ? modelo.display_name.substring(0, 2).toUpperCase()
                      : modelo.email
                        ? modelo.email.substring(0, 2).toUpperCase()
                        : '??'
                    }
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">
                    {modelo.display_name || 'Sem nome'}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {modelo.email || 'Sem email'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-sm flex-shrink-0">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-primary">
                    {modelo.total_contatos.toLocaleString('pt-BR')}
                  </span>
                  <span className="text-muted-foreground hidden sm:inline">contatos</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default ListaModelosPage;
