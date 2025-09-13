import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import PageHeader from '@/components/layout/PageHeader';
import Disparo from '@/components/Disparo';
import UploadAudioTest from '@/components/UploadAudioTest';
import OnboardingGuard from '@/components/onboarding/OnboardingGuard';
import OnboardingPlaceholder from '@/components/onboarding/OnboardingPlaceholder';
import { useOnboardingStatus } from '@/hooks/use-onboarding-status';

const DisparoPage = () => {
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
        description="Para enviar disparos, você precisa conectar seu perfil do Telegram primeiro."
      />
    );
  }

  if (!hasConfiguredWelcome) {
    return (
      <OnboardingPlaceholder
        step="welcome"
        title="Configure as Boas-Vindas"
        description="Configure sua mensagem de boas-vindas antes de começar a enviar disparos."
      />
    );
  }

  return (
    <PageLayout>
      <PageHeader 
        title="Disparo 🚀"
        description="Gerencie seus disparos de mensagens"
        onTitleChange={() => {}}
        onDescriptionChange={() => {}}
      />
      <div className="mt-6">
        <Disparo />
      </div>
    </PageLayout>
  );
};

export default DisparoPage;