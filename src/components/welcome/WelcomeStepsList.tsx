import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronUp, 
  ChevronDown, 
  Edit, 
  Trash2, 
  MessageSquare, 
  Image, 
  Mic, 
  Volume2,
  Clock
} from 'lucide-react';
import WelcomeStepConfirmDialog from './WelcomeStepConfirmDialog';

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

interface WelcomeStepsListProps {
  steps: WelcomeStep[];
  onEditStep: (step: WelcomeStep) => void;
  onDeleteStep: (stepId: string) => void;
  onReorderSteps: (steps: WelcomeStep[]) => void;
}

const WelcomeStepsList: React.FC<WelcomeStepsListProps> = ({
  steps,
  onEditStep,
  onDeleteStep,
  onReorderSteps,
}) => {
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    stepId: string;
    stepName: string;
  }>({
    isOpen: false,
    stepId: '',
    stepName: '',
  });

  const getStepIcon = (kind: string) => {
    switch (kind) {
      case 'text':
        return <MessageSquare className="h-4 w-4" />;
      case 'photo':
        return <Image className="h-4 w-4" />;
      case 'voice':
        return <Mic className="h-4 w-4" />;
      case 'audio':
        return <Volume2 className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStepColor = (kind: string) => {
    switch (kind) {
      case 'text':
        return 'default';
      case 'photo':
        return 'secondary';
      case 'voice':
        return 'destructive';
      case 'audio':
        return 'outline';
      default:
        return 'default';
    }
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newSteps = [...steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= steps.length) return;
    
    // Swap the steps
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    
    // Update order_index values
    newSteps.forEach((step, idx) => {
      step.order_index = idx + 1;
    });
    
    onReorderSteps(newSteps);
  };

  const handleDeleteClick = (stepId: string, stepName: string) => {
    setDeleteDialog({
      isOpen: true,
      stepId,
      stepName,
    });
  };

  const handleConfirmDelete = () => {
    onDeleteStep(deleteDialog.stepId);
    setDeleteDialog({
      isOpen: false,
      stepId: '',
      stepName: '',
    });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      stepId: '',
      stepName: '',
    });
  };

  const formatDelay = (seconds: number) => {
    if (seconds === 0) return 'Sem delay';
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  if (steps.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Nenhum passo configurado</p>
            <p className="text-sm">Clique em "Novo Passo" para começar a criar seu fluxo de boas-vindas.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Passos do Fluxo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex flex-col items-center space-y-1">
              <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                {index + 1}
              </Badge>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant={getStepColor(step.kind)} className="flex items-center space-x-1">
                  {getStepIcon(step.kind)}
                  <span className="capitalize">{step.kind}</span>
                </Badge>
                {step.parse_mode && step.parse_mode !== 'none' && (
                  <Badge variant="outline" className="text-xs">
                    {step.parse_mode}
                  </Badge>
                )}
                {step.delay_after_sec > 0 && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDelay(step.delay_after_sec)}</span>
                  </Badge>
                )}
              </div>
              
              {step.text_content && (
                <div className="mb-2">
                  <p className="text-sm text-muted-foreground mb-1">Conteúdo:</p>
                  <p className="text-sm line-clamp-3">{step.text_content}</p>
                </div>
              )}
              
              {step.media_url && (
                <div className="mb-2">
                  <p className="text-sm text-muted-foreground mb-1">Mídia:</p>
                  <a 
                    href={step.media_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline truncate block"
                  >
                    {step.media_url}
                  </a>
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveStep(index, 'up')}
                disabled={index === 0}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveStep(index, 'down')}
                disabled={index === steps.length - 1}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditStep(step)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteClick(step.id, `Passo ${step.order_index} - ${step.kind}`)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        <WelcomeStepConfirmDialog
          isOpen={deleteDialog.isOpen}
          onClose={handleCloseDeleteDialog}
          onConfirm={handleConfirmDelete}
          title="Excluir Passo"
          description={`Tem certeza que deseja excluir "${deleteDialog.stepName}"? Esta ação não pode ser desfeita.`}
        />
      </CardContent>
    </Card>
  );
};

export default WelcomeStepsList;