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

      // Get user's account_id from profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('account_id')
        .eq('id', session!.user.id)
        .single();

      if (!profile?.account_id) {
        setStatus({
          hasConnectedProfile: false,
          hasConfiguredWelcome: false,
          isComplete: false,
          loading: false,
        });
        return;
      }

      // Check if user has connected Telegram profile
      const { data: telegramSession } = await supabase
        .from('telegram_sessions')
        .select('id, status')
        .eq('account_id', profile.account_id)
        .eq('status', 'active')
        .single();

      const hasConnectedProfile = !!telegramSession;

      // Check if user has configured welcome flow with steps
      const { data: welcomeFlow } = await supabase
        .from('welcome_flows')
        .select(`
          id, 
          enabled,
          welcome_flow_steps!inner(id)
        `)
        .eq('account_id', profile.account_id)
        .eq('enabled', true)
        .single();

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