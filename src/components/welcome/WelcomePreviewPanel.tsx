import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, MessageCircle, Image, Mic, Music } from 'lucide-react';

interface WelcomeStep {
  id: string;
  flow_id: string;
  order_index: number;
  kind: 'text' | 'photo' | 'voice' | 'audio';
  text_content?: string;
  parse_mode?: 'none' | 'html' | 'markdown';
  media_url?: string;
  delay_after_sec: number;
}

interface WelcomePreviewPanelProps {
  steps: WelcomeStep[];
  onRefresh: () => void;
}

const WelcomePreviewPanel: React.FC<WelcomePreviewPanelProps> = ({
  steps,
  onRefresh,
}) => {
  const replacePlaceholders = (text: string): string => {
    const today = new Date().toLocaleDateString('pt-BR');
    return text
      .replace(/\{first_name\}/g, 'Luna')
      .replace(/\{username\}/g, '@luna')
      .replace(/\{today\}/g, today);
  };

  const renderStepPreview = (step: WelcomeStep, index: number) => {
    const getStepIcon = () => {
      switch (step.kind) {
        case 'text':
          return <MessageCircle className="h-4 w-4" />;
        case 'photo':
          return <Image className="h-4 w-4" />;
        case 'voice':
          return <Mic className="h-4 w-4" />;
        case 'audio':
          return <Music className="h-4 w-4" />;
      }
    };

    const renderStepContent = () => {
      switch (step.kind) {
        case 'text':
          return (
            <div className="space-y-2">
              <p className="text-sm">
                {step.text_content ? replacePlaceholders(step.text_content) : 'Sem conteúdo'}
              </p>
              {step.parse_mode && step.parse_mode !== 'none' && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  {step.parse_mode.toUpperCase()}
                </span>
              )}
            </div>
          );
        case 'photo':
          return (
            <div className="space-y-2">
              {step.media_url && (
                <img
                  src={step.media_url}
                  alt="Preview"
                  className="w-full max-w-xs h-32 object-cover rounded-md border"
                />
              )}
              {step.text_content && (
                <p className="text-sm text-muted-foreground">
                  {replacePlaceholders(step.text_content)}
                </p>
              )}
            </div>
          );
        case 'voice':
        case 'audio':
          return (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                {getStepIcon()}
                <span className="text-sm">
                  {step.media_url ? 'Arquivo de áudio' : 'Nenhum arquivo'}
                </span>
              </div>
              {step.text_content && (
                <p className="text-sm text-muted-foreground">
                  {replacePlaceholders(step.text_content)}
                </p>
              )}
            </div>
          );
      }
    };

    return (
      <div key={step.id} className="space-y-3">
        <div className="border rounded-lg p-4 bg-background">
          <div className="flex items-center gap-2 mb-2">
            {getStepIcon()}
            <span className="text-sm font-medium">
              Passo {step.order_index} - {step.kind}
            </span>
          </div>
          {renderStepContent()}
        </div>
        
        {step.delay_after_sec > 0 && (
          <div className="flex justify-center">
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              ⏳ {step.delay_after_sec}s
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Preview do Fluxo</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
        {steps.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhum passo configurado</p>
          </div>
        ) : (
          steps.map((step, index) => renderStepPreview(step, index))
        )}
      </CardContent>
    </Card>
  );
};

export default WelcomePreviewPanel;