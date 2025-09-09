import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Mail, Phone, FileText, ExternalLink, HelpCircle } from 'lucide-react';

const SuportePage = () => {
  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Central de Suporte</h1>
          <p className="text-muted-foreground">Encontre ajuda e entre em contato conosco</p>
        </div>
        {/* Formas de Contato */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <MessageCircle className="h-8 w-8 text-primary mr-3" />
              <h3 className="text-lg font-semibold">Chat ao Vivo</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Fale conosco em tempo real através do nosso chat online.
            </p>
            <Button className="w-full">
              Iniciar Chat
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center mb-4">
              <Mail className="h-8 w-8 text-primary mr-3" />
              <h3 className="text-lg font-semibold">Email</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Envie uma mensagem detalhada para nossa equipe de suporte.
            </p>
            <Button variant="outline" className="w-full">
              suporte@atendigram.com
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center mb-4">
              <Phone className="h-8 w-8 text-primary mr-3" />
              <h3 className="text-lg font-semibold">Telefone</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Ligue para nosso suporte durante o horário comercial.
            </p>
            <Button variant="outline" className="w-full">
              (11) 9999-9999
            </Button>
          </Card>
        </div>

        {/* FAQ */}
        <Card className="p-6">
          <div className="flex items-center mb-6">
            <HelpCircle className="h-6 w-6 text-primary mr-2" />
            <h2 className="text-xl font-semibold">Perguntas Frequentes</h2>
          </div>
          
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="font-medium mb-2">Como posso importar meus contatos?</h3>
              <p className="text-muted-foreground text-sm">
                Você pode importar contatos através da página de Contatos, usando arquivos CSV ou Excel.
              </p>
            </div>
            
            <div className="border-b pb-4">
              <h3 className="font-medium mb-2">Como configurar disparos automáticos?</h3>
              <p className="text-muted-foreground text-sm">
                Acesse a seção Disparos para configurar mensagens automáticas e programar envios.
              </p>
            </div>
            
            <div className="border-b pb-4">
              <h3 className="font-medium mb-2">Posso personalizar as mensagens de boas-vindas?</h3>
              <p className="text-muted-foreground text-sm">
                Sim! Na seção Boas-Vindas você pode criar e personalizar mensagens para novos contatos.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Como visualizar relatórios de desempenho?</h3>
              <p className="text-muted-foreground text-sm">
                O Dashboard oferece uma visão geral dos seus contatos e conversas atendidas.
              </p>
            </div>
          </div>
        </Card>

        {/* Recursos Adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <FileText className="h-6 w-6 text-primary mr-2" />
              <h3 className="text-lg font-semibold">Documentação</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Acesse nossa documentação completa para aprender mais sobre todas as funcionalidades.
            </p>
            <Button variant="outline" className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver Documentação
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center mb-4">
              <MessageCircle className="h-6 w-6 text-primary mr-2" />
              <h3 className="text-lg font-semibold">Status do Sistema</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Verifique o status atual dos nossos serviços e possíveis manutenções.
            </p>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-green-600">Todos os sistemas operacionais</span>
            </div>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default SuportePage;