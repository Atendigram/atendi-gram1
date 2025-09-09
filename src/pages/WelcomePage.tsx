import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getAccountId } from '@/lib/supabase';
import type { Database } from '@/integrations/supabase/types';
import { toast } from '@/hooks/use-toast';
import PageLayout from '@/components/layout/PageLayout';
import WelcomeFlowHeader from '@/components/welcome/WelcomeFlowHeader';
import WelcomeStepsList from '@/components/welcome/WelcomeStepsList';
import WelcomeStepModal from '@/components/welcome/WelcomeStepModal';
import WelcomePreviewPanel from '@/components/welcome/WelcomePreviewPanel';
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
  const [optimisticSteps, setOptimisticSteps] = useState<WelcomeStep[]>([]);

  // Load welcome flow on component mount
  useEffect(() => {
    loadWelcomeFlow();
  }, []);

  const loadWelcomeFlow = async () => {
    setLoading(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Authentication error:', authError);
        toast({
          variant: 'destructive',
          title: 'Erro de autenticação',
          description: 'Usuário não autenticado.',
        });
        return;
      }

      // First get the user's profile to get their account_id
      console.log('Loading profile for user:', user.id);
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('account_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        console.error('Error loading user profile:', profileError);
        toast({
          variant: 'destructive',
          title: 'Erro de perfil',
          description: 'Não foi possível carregar o perfil do usuário.',
        });
        return;
      }

      // Load enabled welcome flows for this account, prioritizing default flow
      console.log('Loading welcome flow for account:', profile.account_id);
      const { data: flowsData, error: flowError } = await supabase
        .from('welcome_flows')
        .select('id, name, enabled, is_default')
        .eq('account_id', profile.account_id)
        .eq('enabled', true)
        .order('is_default', { ascending: false })
        .order('updated_at', { ascending: true });

      if (flowError) {
        console.error('Error loading welcome flows:', flowError);
        setFlow(null);
        setSteps([]);
        return;
      }

      console.log('Welcome flows data:', flowsData);
      const selectedFlow = flowsData && flowsData.length > 0 ? flowsData[0] : null;
      
      if (!selectedFlow) {
        console.log('No enabled welcome flow found for account:', profile.account_id);
        setFlow(null);
        setSteps([]);
        return;
      }

      setFlow(selectedFlow);

      // Load steps for this flow
      await loadSteps(selectedFlow.id);
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
      .select('id, flow_id, order_index, kind, text_content, media_url, delay_after_sec, parse_mode')
      .eq('flow_id', flowId)
      .order('order_index', { ascending: true });

    if (stepsError) {
      console.error('Error loading steps:', stepsError);
      return;
    }

    console.log('Loaded steps:', stepsData);
    const loadedSteps = (stepsData || []) as WelcomeStep[];
    setSteps(loadedSteps);
    setOptimisticSteps(loadedSteps);
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

    // Optimistic update
    const originalSteps = [...steps];
    const updatedSteps = steps.filter(step => step.id !== stepId);
    setOptimisticSteps(updatedSteps);

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
      // Rollback optimistic update
      setOptimisticSteps(originalSteps);
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

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      toast({
        variant: 'destructive',
        title: 'Erro de autenticação',
        description: 'Usuário não autenticado.',
      });
      return;
    }

    // Get user's account_id from profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('account_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      toast({
        variant: 'destructive',
        title: 'Erro de perfil',
        description: 'Não foi possível carregar o perfil do usuário.',
      });
      return;
    }

    const isEditing = !!editingStep;
    let optimisticStep: WelcomeStep;

    if (isEditing) {
      // Optimistic update for editing
      optimisticStep = { ...editingStep!, ...stepData };
      const updatedSteps = optimisticSteps.map(step => 
        step.id === editingStep!.id ? optimisticStep : step
      );
      setOptimisticSteps(updatedSteps);
    } else {
      // Optimistic update for creating
      const maxOrder = optimisticSteps.length > 0 ? Math.max(...optimisticSteps.map(s => s.order_index)) : 0;
      optimisticStep = {
        id: `temp-${Date.now()}`,
        flow_id: flow.id,
        order_index: maxOrder + 1,
        kind: stepData.kind!,
        text_content: stepData.text_content,
        parse_mode: stepData.parse_mode,
        media_url: stepData.media_url,
        delay_after_sec: stepData.delay_after_sec!,
      };
      setOptimisticSteps([...optimisticSteps, optimisticStep]);
    }

    try {
      if (isEditing) {
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
            account_id: profile.account_id,
            flow_id: flow.id,
            order_index: maxOrder + 1,
            kind: stepData.kind!,
            delay_after_sec: stepData.delay_after_sec!,
          } as any);

        if (error) throw error;
      }

      await loadSteps(flow.id);
      setIsModalOpen(false);
      setEditingStep(null);
      toast({
        title: isEditing ? 'Passo atualizado' : 'Passo criado',
        description: `O passo foi ${isEditing ? 'atualizado' : 'criado'} com sucesso.`,
      });
    } catch (error) {
      // Rollback optimistic update
      setOptimisticSteps(steps);
      console.error('Error saving step:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível salvar o passo.',
      });
    }
  };

  const handleReorderSteps = (reorderedSteps: WelcomeStep[]) => {
    setOptimisticSteps(reorderedSteps);
  };

  const handleSaveOrder = async () => {
    if (!flow) return;

    // Validate order_index uniqueness and sequence
    const orderIndexes = optimisticSteps.map(s => s.order_index);
    const uniqueIndexes = new Set(orderIndexes);
    
    if (uniqueIndexes.size !== orderIndexes.length) {
      toast({
        variant: 'destructive',
        title: 'Erro na ordenação',
        description: 'Os índices de ordem devem ser únicos.',
      });
      return;
    }

    const expectedIndexes = Array.from({ length: optimisticSteps.length }, (_, i) => i + 1);
    const sortedIndexes = [...orderIndexes].sort((a, b) => a - b);
    
    if (JSON.stringify(sortedIndexes) !== JSON.stringify(expectedIndexes)) {
      toast({
        variant: 'destructive',
        title: 'Erro na ordenação',
        description: 'Os índices devem ser sequenciais (1, 2, 3...).',
      });
      return;
    }

    setIsSaving(true);
    try {
      const updates = optimisticSteps.map((step, index) => ({
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <WelcomeFlowHeader
            flow={flow}
            onToggleEnabled={toggleFlowEnabled}
            onCreateStep={handleCreateStep}
            onSaveOrder={handleSaveOrder}
            isSaving={isSaving}
          />

          <WelcomeStepsList
            steps={optimisticSteps}
            onEditStep={handleEditStep}
            onDeleteStep={handleDeleteStep}
            onReorderSteps={handleReorderSteps}
          />
        </div>

        <div className="lg:sticky lg:top-6">
          <WelcomePreviewPanel
            steps={optimisticSteps}
            onRefresh={() => flow && loadSteps(flow.id)}
          />
        </div>
      </div>

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
    </PageLayout>
  );
};

export default WelcomePage;