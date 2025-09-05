import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import PageLayout from '@/components/layout/PageLayout';
import WelcomeFlowHeader from '@/components/welcome/WelcomeFlowHeader';
import WelcomeStepsList from '@/components/welcome/WelcomeStepsList';
import WelcomeStepModal from '@/components/welcome/WelcomeStepModal';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface WelcomeFlow {
  id: string;
  name: string;
  enabled: boolean;
}

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

const WelcomePage = () => {
  const [flow, setFlow] = useState<WelcomeFlow | null>(null);
  const [steps, setSteps] = useState<WelcomeStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<WelcomeStep | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load welcome flow on component mount
  useEffect(() => {
    loadWelcomeFlow();
  }, []);

  const loadWelcomeFlow = async () => {
    setLoading(true);
    try {
      // Load the default welcome flow
      const { data: flowData, error: flowError } = await supabase
        .from('welcome_flows')
        .select('id, name, enabled')
        .eq('workspace_id', 'default')
        .eq('is_default', true)
        .limit(1)
        .single();

      if (flowError) {
        console.error('Error loading welcome flow:', flowError);
        setFlow(null);
        setSteps([]);
        return;
      }

      setFlow(flowData);

      // Load steps for this flow
      if (flowData?.id) {
        await loadSteps(flowData.id);
      }
    } catch (error) {
      console.error('Error loading welcome flow:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar',
        description: 'Não foi possível carregar o fluxo de boas-vindas.',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSteps = async (flowId: string) => {
    const { data: stepsData, error: stepsError } = await supabase
      .from('welcome_flow_steps')
      .select('*')
      .eq('flow_id', flowId)
      .order('order_index', { ascending: true });

    if (stepsError) {
      console.error('Error loading steps:', stepsError);
      return;
    }

    setSteps(stepsData || []);
  };

  const toggleFlowEnabled = async () => {
    if (!flow) return;

    try {
      const { error } = await supabase
        .from('welcome_flows')
        .update({ enabled: !flow.enabled })
        .eq('id', flow.id);

      if (error) throw error;

      setFlow({ ...flow, enabled: !flow.enabled });
      toast({
        title: flow.enabled ? 'Fluxo desabilitado' : 'Fluxo habilitado',
        description: `O fluxo de boas-vindas foi ${flow.enabled ? 'desabilitado' : 'habilitado'} com sucesso.`,
      });
    } catch (error) {
      console.error('Error toggling flow:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível alterar o status do fluxo.',
      });
    }
  };

  const handleCreateStep = () => {
    setEditingStep(null);
    setIsModalOpen(true);
  };

  const handleEditStep = (step: WelcomeStep) => {
    setEditingStep(step);
    setIsModalOpen(true);
  };

  const handleDeleteStep = async (stepId: string) => {
    if (!flow) return;

    try {
      const { error } = await supabase
        .from('welcome_flow_steps')
        .delete()
        .eq('id', stepId);

      if (error) throw error;

      await loadSteps(flow.id);
      toast({
        title: 'Passo excluído',
        description: 'O passo foi excluído com sucesso.',
      });
    } catch (error) {
      console.error('Error deleting step:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível excluir o passo.',
      });
    }
  };

  const handleSaveStep = async (stepData: Partial<WelcomeStep>) => {
    if (!flow) return;

    try {
      if (editingStep) {
        // Update existing step
        const { error } = await supabase
          .from('welcome_flow_steps')
          .update(stepData)
          .eq('id', editingStep.id);

        if (error) throw error;
      } else {
        // Create new step
        const maxOrder = steps.length > 0 ? Math.max(...steps.map(s => s.order_index)) : 0;
        const { error } = await supabase
          .from('welcome_flow_steps')
          .insert({
            ...stepData,
            flow_id: flow.id,
            order_index: maxOrder + 1,
          });

        if (error) throw error;
      }

      await loadSteps(flow.id);
      setIsModalOpen(false);
      setEditingStep(null);
      toast({
        title: editingStep ? 'Passo atualizado' : 'Passo criado',
        description: `O passo foi ${editingStep ? 'atualizado' : 'criado'} com sucesso.`,
      });
    } catch (error) {
      console.error('Error saving step:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível salvar o passo.',
      });
    }
  };

  const handleReorderSteps = (reorderedSteps: WelcomeStep[]) => {
    setSteps(reorderedSteps);
  };

  const handleSaveOrder = async () => {
    if (!flow) return;

    setIsSaving(true);
    try {
      const updates = steps.map((step, index) => ({
        id: step.id,
        order_index: index + 1,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('welcome_flow_steps')
          .update({ order_index: update.order_index })
          .eq('id', update.id);

        if (error) throw error;
      }

      await loadSteps(flow.id);
      toast({
        title: 'Ordem salva',
        description: 'A ordem dos passos foi salva com sucesso.',
      });
    } catch (error) {
      console.error('Error saving order:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível salvar a ordem dos passos.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando fluxo de boas-vindas...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!flow) {
    return (
      <PageLayout>
        <Card className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Nenhum fluxo de boas-vindas padrão foi encontrado. Por favor, configure um fluxo primeiro.
            </AlertDescription>
          </Alert>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <WelcomeFlowHeader
          flow={flow}
          onToggleEnabled={toggleFlowEnabled}
          onCreateStep={handleCreateStep}
          onSaveOrder={handleSaveOrder}
          isSaving={isSaving}
        />

        <WelcomeStepsList
          steps={steps}
          onEditStep={handleEditStep}
          onDeleteStep={handleDeleteStep}
          onReorderSteps={handleReorderSteps}
        />

        {isModalOpen && (
          <WelcomeStepModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditingStep(null);
            }}
            onSave={handleSaveStep}
            editingStep={editingStep}
          />
        )}
      </div>
    </PageLayout>
  );
};

export default WelcomePage;