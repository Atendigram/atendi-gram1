import React, { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import TabContainer, { TabItem } from '@/components/layout/TabContainer';
import AutoReplyRulesList from '@/components/auto-reply/AutoReplyRulesList';
import AutoReplyRuleModal from '@/components/auto-reply/AutoReplyRuleModal';
import AutoReplyMessagesList from '@/components/auto-reply/AutoReplyMessagesList';
import AutoReplyDashboard from '@/components/auto-reply/AutoReplyDashboard';
import AutoReplyLogTable from '@/components/auto-reply/AutoReplyLogTable';
import { Button } from '@/components/ui/button';
import { Plus, Bot } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboardingStatus } from '@/hooks/use-onboarding-status';
import { useNavigate } from 'react-router-dom';

const AutoReplyPage = () => {
  const { profile } = useAuth();
  const { hasConnectedProfile, loading: onboardingLoading } = useOnboardingStatus();
  const navigate = useNavigate();
  const isAdmin = profile?.role === 'admin';

  const [activeTab, setActiveTab] = useState('rules');
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // State para navegação interna: quando o usuário clica em "Mensagens" de uma regra
  const [selectedRuleForMessages, setSelectedRuleForMessages] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleCreateRule = () => {
    setEditingRuleId(null);
    setIsRuleModalOpen(true);
  };

  const handleEditRule = (ruleId: string) => {
    setEditingRuleId(ruleId);
    setIsRuleModalOpen(true);
  };

  const handleRuleModalClose = () => {
    setIsRuleModalOpen(false);
    setEditingRuleId(null);
  };

  const handleRuleSaved = () => {
    setIsRuleModalOpen(false);
    setEditingRuleId(null);
    setRefreshKey(prev => prev + 1);
  };

  const handleOpenMessages = (ruleId: string, ruleName: string) => {
    setSelectedRuleForMessages({ id: ruleId, name: ruleName });
  };

  const handleBackFromMessages = () => {
    setSelectedRuleForMessages(null);
    // Refresh para atualizar contagens de mensagens
    setRefreshKey(prev => prev + 1);
  };

  const getTabActions = () => {
    if (activeTab === 'rules' && !selectedRuleForMessages) {
      return (
        <Button onClick={handleCreateRule} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Regra
        </Button>
      );
    }
    return null;
  };

  // Conteúdo da aba Regras: ou a lista de regras, ou o pool de mensagens de uma regra
  const rulesTabContent = selectedRuleForMessages ? (
    <AutoReplyMessagesList
      ruleId={selectedRuleForMessages.id}
      ruleName={selectedRuleForMessages.name}
      onBack={handleBackFromMessages}
    />
  ) : (
    <AutoReplyRulesList
      key={refreshKey}
      onEditRule={handleEditRule}
      onCreateRule={handleCreateRule}
      onOpenMessages={handleOpenMessages}
      refreshKey={refreshKey}
      onRefresh={() => setRefreshKey(prev => prev + 1)}
    />
  );

  const tabs: TabItem[] = [
    {
      value: 'rules',
      label: 'Regras',
      content: rulesTabContent,
    },
    {
      value: 'dashboard',
      label: 'Dashboard',
      content: <AutoReplyDashboard />,
    },
    {
      value: 'logs',
      label: 'Logs',
      content: <AutoReplyLogTable />,
    },
  ];

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Banner de conexão pendente */}
        {!onboardingLoading && !hasConnectedProfile && !isAdmin && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-amber-800">Perfil do Telegram não conectado</h3>
                <p className="mt-1 text-sm text-amber-700">
                  Conecte seu perfil do Telegram para usar as respostas automáticas.
                </p>
                <Button onClick={() => navigate('/conectar-perfil')} className="mt-3" size="sm">
                  Conectar Agora
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              Respostas Automáticas
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure regras para responder automaticamente com base em palavras-chave
            </p>
          </div>
          {getTabActions()}
        </div>

        <TabContainer
          tabs={tabs}
          defaultValue={activeTab}
          onValueChange={(value) => {
            setActiveTab(value);
            // Ao trocar de aba, sair da sub-view de mensagens
            if (value !== 'rules') {
              setSelectedRuleForMessages(null);
            }
          }}
        />

        {/* Modal de criar/editar regra */}
        {isRuleModalOpen && (
          <AutoReplyRuleModal
            isOpen={isRuleModalOpen}
            onClose={handleRuleModalClose}
            onSaved={handleRuleSaved}
            editingRuleId={editingRuleId}
          />
        )}
      </div>
    </PageLayout>
  );
};

export default AutoReplyPage;