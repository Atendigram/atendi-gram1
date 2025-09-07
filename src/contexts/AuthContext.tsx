import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  account_id?: string;
  email: string | null;
  display_name: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
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
    console.log('🔍 Fetching profile for user:', userId);
    try {
      const { data: profile, error } = await (supabase as any)
        .from('profiles')
        .select('id, account_id, email, display_name')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.log('❌ Error fetching profile from database:', error);
        // Fallback to user data if profile doesn't exist
        return {
          id: userId,
          email: currentUser?.email || null,
          display_name: currentUser?.user_metadata?.display_name || null,
        };
      }

      if (!profile) {
        console.log('⚠️ No profile found, using fallback');
        return {
          id: userId,
          email: currentUser?.email || null,
          display_name: currentUser?.user_metadata?.display_name || null,
        };
      }

      console.log('✅ Profile fetched successfully:', profile);
      return profile;
    } catch (error) {
      console.log('💥 Exception fetching profile, using basic data:', error);
      return {
        id: userId,
        email: currentUser?.email || null,
        display_name: null,
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

  useEffect(() => {
    console.log('🚀 AuthProvider useEffect started');
    
    // Timeout de segurança para evitar loading infinito
    const loadingTimeout = setTimeout(() => {
      console.log('⏰ Loading timeout reached, forcing loading to false');
      setLoading(false);
    }, 5000); // 5 segundos de timeout
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event, !!session);
        clearTimeout(loadingTimeout); // Limpar timeout se auth responder
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            const profileData = await fetchProfile(session.user.id, session.user);
            setProfile(profileData);
          } catch (error) {
            console.log('Error in profile fetch, continuing with fallback');
            setProfile({
              id: session.user.id,
              email: session.user.email || null,
              display_name: null,
            });
          }
        } else {
          setProfile(null);
        }
        
        console.log('✅ Auth state processing complete, setting loading false');
        setLoading(false);
      }
    );

    // Get initial session
    const getInitialSession = async () => {
      console.log('📋 Getting initial session...');
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        clearTimeout(loadingTimeout); // Limpar timeout se session responder
        
        if (error) {
          console.error('❌ Error getting session:', error);
          setLoading(false);
          return;
        }

        console.log('📋 Initial session result:', !!session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            const profileData = await fetchProfile(session.user.id, session.user);
            setProfile(profileData);
          } catch (error) {
            console.log('Error in initial profile fetch, using fallback');
            setProfile({
              id: session.user.id,
              email: session.user.email || null,
              display_name: null,
            });
          }
        }
        
        console.log('✅ Initial session processing complete, setting loading false');
        setLoading(false);
      } catch (error) {
        console.error('💥 Exception getting initial session:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      subscription.unsubscribe();
      clearTimeout(loadingTimeout);
    };
  }, []);

  const value: AuthContextType = {
    session,
    user,
    profile,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};