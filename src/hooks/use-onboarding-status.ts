import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface OnboardingStatus {
  hasConnectedProfile: boolean;
  hasConfiguredWelcome: boolean;
  isComplete: boolean;
  loading: boolean;
}

export const useOnboardingStatus = () => {
  const { session } = useAuth();
  const [status, setStatus] = useState<OnboardingStatus>({
    hasConnectedProfile: false,
    hasConfiguredWelcome: false,
    isComplete: false,
    loading: true,
  });

  useEffect(() => {
    if (!session?.user) {
      setStatus({
        hasConnectedProfile: false,
        hasConfiguredWelcome: false,
        isComplete: false,
        loading: false,
      });
      return;
    }

    checkOnboardingStatus();
  }, [session]);

  const checkOnboardingStatus = async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true }));

      // Get user's profile first
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, account_id')
        .eq('id', session!.user.id)
        .maybeSingle();

      if (!profile) {
        setStatus({
          hasConnectedProfile: false,
          hasConfiguredWelcome: false,
          isComplete: false,
          loading: false,
        });
        return;
      }

      // Checa diretamente em telegram_sessions se há sessão conectada do perfil ou da conta
      console.log('🔍 Verificando conexão Telegram para profile:', profile.id, 'account:', profile.account_id);
      
      const { data: connectedSessions, error: sessionsError } = await supabase
        .from('telegram_sessions')
        .select('id, owner_id, status')
        .eq('status', 'connected')
        .in('owner_id', [profile.id, profile.account_id]);

      console.log('📱 Sessões conectadas encontradas:', connectedSessions);
      if (sessionsError) {
        console.error('❌ Erro ao buscar telegram_sessions:', sessionsError);
      }

      const hasConnectedProfile = Array.isArray(connectedSessions) && connectedSessions.length > 0;
      console.log('✅ hasConnectedProfile:', hasConnectedProfile);

      // Check for welcome flow configuration

      const { data: welcomeFlow } = await supabase
        .from('welcome_flows')
        .select('id, enabled, welcome_flow_steps(id)')
        .eq('account_id', profile.account_id)
        .eq('enabled', true)
        .limit(1)
        .maybeSingle();

      const hasConfiguredWelcome = !!(welcomeFlow && welcomeFlow.welcome_flow_steps.length > 0);

      const isComplete = hasConnectedProfile && hasConfiguredWelcome;

      setStatus({
        hasConnectedProfile,
        hasConfiguredWelcome,
        isComplete,
        loading: false,
      });
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setStatus({
        hasConnectedProfile: false,
        hasConfiguredWelcome: false,
        isComplete: false,
        loading: false,
      });
    }
  };

  const refreshStatus = () => {
    checkOnboardingStatus();
  };

  return { ...status, refreshStatus };
};