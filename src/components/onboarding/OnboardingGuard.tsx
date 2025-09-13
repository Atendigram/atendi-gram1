import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useOnboardingStatus } from '@/hooks/use-onboarding-status';
import { Loader2 } from 'lucide-react';

interface OnboardingGuardProps {
  children: React.ReactNode;
  requireProfileConnection?: boolean;
  requireWelcomeConfig?: boolean;
}

const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ 
  children, 
  requireProfileConnection = false,
  requireWelcomeConfig = false 
}) => {
  const { hasConnectedProfile, hasConfiguredWelcome, loading } = useOnboardingStatus();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Verificando configuração...</p>
        </div>
      </div>
    );
  }

  // Step 1: Profile connection required
  if (requireProfileConnection && !hasConnectedProfile) {
    return <Navigate to="/conectar-perfil" state={{ from: location }} replace />;
  }

  // Step 2: Welcome configuration required (only if profile is connected)
  if (requireWelcomeConfig && hasConnectedProfile && !hasConfiguredWelcome) {
    return <Navigate to="/boas-vindas" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default OnboardingGuard;