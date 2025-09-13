import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import ContatosList from '@/components/ContatosList';
import OnboardingPlaceholder from '@/components/onboarding/OnboardingPlaceholder';
import { useOnboardingStatus } from '@/hooks/use-onboarding-status';

const Contatos = () => {
  const { hasConnectedProfile, hasConfiguredWelcome, loading } = useOnboardingStatus();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  // Show placeholder if onboarding not complete
  if (!hasConnectedProfile) {
    return (
      <OnboardingPlaceholder
        step="profile"
        title="Conecte seu Perfil"
        description="Para gerenciar contatos, você precisa conectar seu perfil do Telegram primeiro."
      />
    );
  }

  if (!hasConfiguredWelcome) {
    return (
      <OnboardingPlaceholder
        step="welcome"
        title="Configure as Boas-Vindas"
        description="Configure sua mensagem de boas-vindas antes de gerenciar seus contatos."
      />
    );
  }

  return (
    <PageLayout>
      <ContatosList />
    </PageLayout>
  );
};

export default Contatos;