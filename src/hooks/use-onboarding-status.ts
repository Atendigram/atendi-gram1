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

      // Check if profile has connected Telegram using the new logic
      // A profile is connected if there's a telegram_session where:
      // status = 'connected' AND (owner_id = profile.id OR owner_id = profile.account_id)
      console.log('🔍 Checking telegram connection for profile:', profile.id, 'account:', profile.account_id);
      
      // Try two separate queries to avoid .or() issues
      const { data: sessionsByProfile } = await supabase
        .from('telegram_sessions')
        .select('id, phone_number, status, owner_id')
        .eq('status', 'connected')
        .eq('owner_id', profile.id);

      const { data: sessionsByAccount } = await supabase
        .from('telegram_sessions')
        .select('id, phone_number, status, owner_id')
        .eq('status', 'connected')
        .eq('owner_id', profile.account_id);

      const telegramSessions = [...(sessionsByProfile || []), ...(sessionsByAccount || [])];
      console.log('📱 Telegram sessions found:', telegramSessions);

      const hasConnectedProfile = telegramSessions.length > 0;

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