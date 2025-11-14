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

      // Get user's profile first using email (not session.user.id)
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, account_id')
        .eq('email', session!.user.email)
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

      // Usa a view view_profiles_connection_status para verificar conexão
      console.log('🔍 Verificando conexão Telegram para profile:', profile.id, 'account:', profile.account_id);
      
      const { data: connectionStatus, error: sessionsError } = await supabase
        .from('view_profiles_connection_status')
        .select('profile_id, display_name, account_id, connected_sessions, last_connected_at, session_owner_ids')
        .eq('profile_id', profile.id)
        .maybeSingle();

      console.log('📱 Status de conexão encontrado:', connectionStatus);
      if (sessionsError) {
        console.error('❌ Erro ao buscar view_profiles_connection_status:', sessionsError);
      }

      const hasConnectedProfile = !!(connectionStatus && connectionStatus.connected_sessions > 0);
      console.log('✅ hasConnectedProfile:', hasConnectedProfile, '| connected_sessions:', connectionStatus?.connected_sessions);

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