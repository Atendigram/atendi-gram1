import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Save, Wand2 } from 'lucide-react';

interface WelcomeFlow {
  id: string;
  name: string;
  enabled: boolean;
}

interface WelcomeFlowHeaderProps {
  flow: WelcomeFlow;
  onToggleEnabled: () => void;
  onCreateStep: () => void;
  onSaveOrder: () => void;
  isSaving: boolean;
}

const WelcomeFlowHeader: React.FC<WelcomeFlowHeaderProps> = ({
  flow,
  onToggleEnabled,
  onCreateStep,
  onSaveOrder,
  isSaving,
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Welcome Flow
          </CardTitle>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label htmlFor="flow-enabled" className="text-sm font-medium">
                {flow.enabled ? 'Ativo' : 'Inativo'}
              </label>
              <Switch
                id="flow-enabled"
                checked={flow.enabled}
                onCheckedChange={onToggleEnabled}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">{flow.name}</h3>
            <p className="text-sm text-muted-foreground">
              Gerencie os passos do fluxo de boas-vindas
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={onSaveOrder}
              disabled={isSaving}
              variant="outline"
              size="sm"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar Ordem'}
            </Button>
            <Button onClick={onCreateStep} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Novo Passo
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeFlowHeader;