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

      const userEmail = session!.user.email;
      if (!userEmail) {
        setStatus({
          hasConnectedProfile: false,
          hasConfiguredWelcome: false,
          isComplete: false,
          loading: false,
        });
        return;
      }

      // Use the exact query structure provided by user
      const { data: telegramCheck } = await supabase
        .from('telegram_sessions')
        .select(`
          id,
          phone_number,
          status,
          accounts!inner(
            id,
            owner_id,
            profiles!inner(
              id,
              email
            )
          )
        `)
        .eq('accounts.profiles.email', userEmail.toLowerCase())
        .eq('status', 'connected')
        .limit(1)
        .maybeSingle();

      const hasConnectedProfile = !!telegramCheck;

      // Get account_id for welcome flow check
      const { data: profile } = await supabase
        .from('profiles')
        .select('account_id')
        .eq('id', session!.user.id)
        .maybeSingle();

      if (!profile?.account_id) {
        setStatus({
          hasConnectedProfile,
          hasConfiguredWelcome: false,
          isComplete: hasConnectedProfile,
          loading: false,
        });
        return;
      }

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