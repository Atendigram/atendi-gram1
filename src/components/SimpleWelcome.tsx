import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Settings, Play } from 'lucide-react';

const SimpleWelcome = () => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Configuração de Boas-Vindas</h2>
        <p className="text-muted-foreground">
          Configure mensagens automáticas para novos contatos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Card */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold">Status das Boas-Vindas</h3>
              <p className="text-sm text-muted-foreground">Ativo</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Mensagens enviadas hoje:</span>
              <span className="font-medium">0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total este mês:</span>
              <span className="font-medium">0</span>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Ações Rápidas</h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Settings className="h-4 w-4 mr-2" />
              Configurar Mensagens
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Play className="h-4 w-4 mr-2" />
              Testar Fluxo
            </Button>
          </div>
        </Card>
      </div>

      {/* Preview Section */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Prévia das Mensagens</h3>
        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">Mensagem de Boas-Vindas</p>
                <p className="text-sm text-muted-foreground">
                  Olá! 👋 Bem-vindo(a) ao nosso sistema! Estamos muito felizes em tê-lo(a) conosco!
                </p>
                <p className="text-xs text-muted-foreground mt-2">Enviada automaticamente</p>
              </div>
            </div>
          </div>
          
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-secondary-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">Mensagem de Seguimento</p>
                <p className="text-sm text-muted-foreground">
                  Não se esqueça de salvar nosso contato! 📞
                </p>
                <p className="text-xs text-muted-foreground mt-2">Enviada após 5 minutos</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Note */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Para configurações avançadas, acesse a página dedicada de Boas-Vindas</p>
      </div>
    </div>
  );
};

export default SimpleWelcome;