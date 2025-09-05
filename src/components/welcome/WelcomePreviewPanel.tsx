import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, MessageCircle, Image, Mic, Music, Play, Bot } from 'lucide-react';

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

  const renderFormattedText = (text: string, parseMode: string | undefined): JSX.Element => {
    const processedText = replacePlaceholders(text);
    
    if (parseMode === 'html') {
      return (
        <div 
          className="leading-relaxed break-words" 
          dangerouslySetInnerHTML={{ __html: processedText }}
        />
      );
    } else if (parseMode === 'markdown') {
      // Basic markdown support
      let formatted = processedText
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>');
      
      return (
        <div 
          className="leading-relaxed break-words" 
          dangerouslySetInnerHTML={{ __html: formatted }}
        />
      );
    }
    
    return <div className="leading-relaxed break-words">{processedText}</div>;
  };

  const renderStepPreview = (step: WelcomeStep, index: number) => {
    const renderStepContent = () => {
      switch (step.kind) {
        case 'text':
          return (
            <div className="py-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm p-3 shadow-sm border max-w-sm">
                    {step.text_content ? (
                      renderFormattedText(step.text_content, step.parse_mode)
                    ) : (
                      <div className="text-gray-400 italic">Sem conteúdo</div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 ml-1">
                    Bot • agora
                    {step.parse_mode && step.parse_mode !== 'none' && (
                      <span className="ml-2 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs">
                        {step.parse_mode.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );

        case 'photo':
          return (
            <div className="py-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm overflow-hidden shadow-sm border max-w-sm">
                    {step.media_url ? (
                      <img
                        src={step.media_url}
                        alt="Preview"
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          const target = e.currentTarget;
                          const fallback = target.nextElementSibling as HTMLElement;
                          target.style.display = 'none';
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <Image className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Nenhuma imagem</p>
                        </div>
                      </div>
                    )}
                    <div style={{ display: 'none' }} className="w-full h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <Image className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Erro ao carregar imagem</p>
                      </div>
                    </div>
                    
                    {step.text_content && (
                      <div className="p-3 border-t">
                        {renderFormattedText(step.text_content, step.parse_mode)}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 ml-1">
                    Bot • agora
                  </div>
                </div>
              </div>
            </div>
          );

        case 'voice':
          return (
            <div className="py-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm p-3 shadow-sm border max-w-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        {step.media_url ? (
                          <Play className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <Mic className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                            {step.media_url && (
                              <div className="w-0 h-full bg-blue-500 transition-all duration-300"></div>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {step.media_url ? "0:00" : "Nenhum áudio"}
                        </div>
                      </div>
                    </div>
                    
                    {step.text_content && (
                      <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                        {renderFormattedText(step.text_content, step.parse_mode)}
                      </div>
                    )}
                    
                    {step.media_url && (
                      <audio controls className="w-full mt-2 opacity-50 pointer-events-none">
                        <source src={step.media_url} />
                      </audio>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 ml-1">
                    Bot • agora
                  </div>
                </div>
              </div>
            </div>
          );

        case 'audio':
          return (
            <div className="py-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm p-3 shadow-sm border max-w-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        {step.media_url ? (
                          <Play className="w-4 h-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <Music className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {step.media_url ? "Arquivo de áudio" : "Nenhum arquivo"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {step.media_url ? "0:00 • 0.0 MB" : "Selecione um arquivo"}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                            {step.media_url && (
                              <div className="w-0 h-full bg-green-500 transition-all duration-300"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {step.text_content && (
                      <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                        {renderFormattedText(step.text_content, step.parse_mode)}
                      </div>
                    )}
                    
                    {step.media_url && (
                      <audio controls className="w-full mt-2 opacity-50 pointer-events-none">
                        <source src={step.media_url} />
                      </audio>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 ml-1">
                    Bot • agora
                  </div>
                </div>
              </div>
            </div>
          );

        default:
          return null;
      }
    };

    return (
      <div key={step.id} className="space-y-3">
        {renderStepContent()}
        
        {step.delay_after_sec > 0 && (
          <div className="flex justify-center py-2">
            <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full border">
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
              <span>aguarda {step.delay_after_sec}s</span>
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
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
      <CardContent className="space-y-4 max-h-[600px] overflow-y-auto bg-gray-50 dark:bg-gray-900/30"
        style={{
          '--telegram-text-line-height': '1.4',
        } as React.CSSProperties}
      >
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