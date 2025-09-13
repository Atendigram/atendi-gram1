import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, ArrowRight, Phone, MessageSquare } from 'lucide-react';

interface OnboardingPlaceholderProps {
  step: 'profile' | 'welcome';
  title: string;
  description: string;
}

const OnboardingPlaceholder: React.FC<OnboardingPlaceholderProps> = ({ 
  step, 
  title, 
  description 
}) => {
  const navigate = useNavigate();

  const getStepInfo = () => {
    switch (step) {
      case 'profile':
        return {
          icon: <Phone className="h-12 w-12 text-blue-500" />,
          actionText: 'Conectar Perfil',
          actionPath: '/conectar-perfil',
          message: 'Você precisa conectar seu perfil do Telegram primeiro',
          details: 'Para usar esta funcionalidade, conecte sua conta do Telegram nas configurações.'
        };
      case 'welcome':
        return {
          icon: <MessageSquare className="h-12 w-12 text-green-500" />,
          actionText: 'Configurar Boas-Vindas',
          actionPath: '/boas-vindas',
          message: 'Configure sua mensagem de boas-vindas primeiro',
          details: 'Defina como você vai receber seus novos contatos antes de começar a enviar mensagens.'
        };
      default:
        return {
          icon: <Lock className="h-12 w-12 text-gray-400" />,
          actionText: 'Continuar',
          actionPath: '/',
          message: 'Funcionalidade bloqueada',
          details: 'Complete os passos anteriores para acessar esta área.'
        };
    }
  };

  const stepInfo = getStepInfo();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {stepInfo.icon}
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              {stepInfo.message}
            </AlertDescription>
          </Alert>
          
          <p className="text-sm text-muted-foreground text-center">
            {stepInfo.details}
          </p>
          
          <Button 
            onClick={() => navigate(stepInfo.actionPath)}
            className="w-full"
          >
            {stepInfo.actionText}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingPlaceholder;