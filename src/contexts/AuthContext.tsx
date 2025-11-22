import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  account_id?: string;
  email: string | null;
  display_name: string | null;
  account_name?: string | null;
  avatar_url?: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  loadAccountData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string, currentUser: any): Promise<Profile | null> => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select(`
          id, 
          account_id, 
          email, 
          display_name,
          accounts:account_id (
            name,
            avatar_url
          )
        `)
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        // Fallback: criar perfil básico
        return {
          id: userId,
          email: currentUser?.email || null,
          display_name: currentUser?.user_metadata?.display_name || 
                       currentUser?.email?.split('@')[0] || 
                       'Usuário',
          account_id: undefined,
        };
      }

      if (profileData) {
        return {
          id: profileData.id,
          email: profileData.email || currentUser?.email || null,
          display_name: profileData.display_name || currentUser?.email?.split('@')[0] || 'Usuário',
          account_id: profileData.account_id,
          account_name: profileData.accounts?.name || null,
          avatar_url: profileData.accounts?.avatar_url || null,
        };
      }

      // Nenhum perfil encontrado - criar básico
      return {
        id: userId,
        email: currentUser?.email || null,
        display_name: currentUser?.user_metadata?.display_name || 
                     currentUser?.email?.split('@')[0] || 
                     'Usuário',
        account_id: undefined,
      };
    } catch (error) {
      return {
        id: userId,
        email: currentUser?.email || null,
        display_name: currentUser?.email?.split('@')[0] || 'Usuário',
        account_id: undefined,
      };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao fazer logout",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Logout realizado", 
        description: "Você foi desconectado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    }
  };

  // Função separada para carregar dados da conta (não durante auth)
  const loadAccountData = async () => {
    if (!session?.user?.id || !profile) return;
    
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select(`
          id, 
          account_id, 
          email, 
          display_name,
          accounts:account_id (
            name,
            avatar_url
          )
        `)
        .eq('id', session.user.id)
        .maybeSingle();

      if (!error && profileData) {
        const accountName = profileData.accounts?.name || null;
        const avatarUrl = profileData.accounts?.avatar_url || null;
        
        // Atualizar profile com dados frescos do banco (sem fallbacks)
        setProfile({
          id: profileData.id,
          email: profileData.email || profile.email,
          display_name: profileData.display_name,
          account_id: profileData.account_id,
          account_name: accountName,
          avatar_url: avatarUrl,
        });
      }
    } catch (error) {
      console.error('Error loading account data:', error);
    }
  };

  useEffect(() => {
    let mounted = true;
    let refreshTimer: NodeJS.Timeout | null = null;
    
    // Função para agendar refresh do token
    const scheduleTokenRefresh = (session: Session | null) => {
      // Limpar timer anterior
      if (refreshTimer) {
        clearTimeout(refreshTimer);
        refreshTimer = null;
      }
      
      if (!session?.expires_at) return;
      
      // Calcular tempo até a expiração (em milissegundos)
      const expiresAt = session.expires_at * 1000; // converter para ms
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;
      
      // Renovar 5 minutos (300000 ms) antes de expirar
      const refreshBuffer = 5 * 60 * 1000;
      const timeUntilRefresh = timeUntilExpiry - refreshBuffer;
      
      // Se já passou do tempo de refresh, renovar imediatamente
      if (timeUntilRefresh <= 0) {
        console.log('🔄 Token próximo de expirar, renovando imediatamente');
        supabase.auth.refreshSession();
        return;
      }
      
      console.log(`⏰ Token será renovado em ${Math.round(timeUntilRefresh / 1000 / 60)} minutos`);
      
      // Agendar refresh automático
      refreshTimer = setTimeout(async () => {
        if (!mounted) return;
        console.log('🔄 Renovando token automaticamente');
        const { data, error } = await supabase.auth.refreshSession();
        if (error) {
          console.error('❌ Erro ao renovar token:', error);
        } else {
          console.log('✅ Token renovado com sucesso');
        }
      }, timeUntilRefresh);
    };
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('🔐 Auth event:', event);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Agendar renovação automática do token
        if (session) {
          scheduleTokenRefresh(session);
        }
        
        if (session?.user) {
          const profileData = await fetchProfile(session.user.id, session.user);
          if (mounted) {
            setProfile(profileData);
          }
        } else {
          if (mounted) {
            setProfile(null);
          }
        }
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('Error getting session:', error);
          // Limpar sessão inválida e localStorage
          try {
            await supabase.auth.signOut();
            localStorage.removeItem('sb-sjafivptbizdrzkozonv-auth-token');
          } catch (e) {
            console.error('Error clearing session:', e);
          }
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const profileData = await fetchProfile(session.user.id, session.user);
          if (mounted) {
            setProfile(profileData);
          }
        } else {
          setProfile(null);
        }
        
        if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        // Limpar tudo em caso de erro, incluindo localStorage
        try {
          await supabase.auth.signOut();
          localStorage.removeItem('sb-sjafivptbizdrzkozonv-auth-token');
        } catch (e) {
          console.error('Error clearing session:', e);
        }
        if (mounted) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    session,
    user,
    profile,
    loading,
    signOut,
    loadAccountData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};