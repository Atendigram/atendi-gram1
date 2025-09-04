import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Calendar,
  Wallet,
  Trash2,
  Plus,
  X,
  Check,
  Edit,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { EditableField } from './ui/editable-field';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { supabase } from '../integrations/supabase/client'; // já usa o client pré-configurado do Lovable

/* ----------------------------------------------------------------
   Dados de exemplo (gráficos)
----------------------------------------------------------------- */
const revenueData = [
  { month: 'Jan', revenue: 1500 },
  { month: 'Fév', revenue: 2200 },
  { month: 'Mar', revenue: 2500 },
  { month: 'Avr', revenue: 2800 },
  { month: 'Mai', revenue: 3200 },
  { month: 'Juin', revenue: 3500 },
  { month: 'Juil', revenue: 4000 },
];

const productionData = [
  { name: 'Canne à Sucre', value: 40 },
  { name: 'Banane', value: 25 },
  { name: 'Ananas', value: 15 },
  { name: 'Igname', value: 10 },
  { name: 'Autre', value: 10 },
];

/* ===== Alertas de Conversa (tabela principal) ===== */
type ConversationAlert = {
  id: number;
  type: 'Pico de mensagens' | 'Queda de resposta' | 'Outros';
  team: string;
  startDate: string;
  endDate: string;
  severity: 'crítica' | 'moderada' | 'baixa';
  description: string;
};

const initialConversationAlerts: ConversationAlert[] = [
  {
    id: 1,
    type: 'Pico de mensagens',
    team: 'Todos os canais',
    startDate: '2023-09-09',
    endDate: '2023-09-11',
    severity: 'crítica',
    description: 'Grande volume de mensagens entrando',
  },
  {
    id: 2,
    type: 'Queda de resposta',
    team: 'Equipe Suporte',
    startDate: '2023-09-19',
    endDate: '2023-09-22',
    severity: 'moderada',
    description: 'Tempo médio de resposta acima do esperado',
  },
];

const Dashboard = () => {
  /* Cabeçalho */
  const [title, setTitle] = useState('Olá, Atendente 👋');
  const [description, setDescription] = useState(
    'Aqui está uma visão geral do seu atendimento no AtendiGram'
  );
  const [currentMonth, setCurrentMonth] = useState('Agosto 2023');

  /* ====== CARDS ====== */
  const [totalContacts, setTotalContacts] = useState(0);
  const [contactsGrowth, setContactsGrowth] = useState(8.5);

  const [activeContacts, setActiveContacts] = useState(0);
  const [newContacts, setNewContacts] = useState(5);

  const [attendedConversations, setAttendedConversations] = useState(0);
  const [conversationsGrowth, setConversationsGrowth] = useState(5.2);

  const [totalMessages, setTotalMessages] = useState(0);

  /* ===== tabela: Alertas de Conversa ===== */
  const [conversationAlerts, setConversationAlerts] =
    useState<ConversationAlert[]>(initialConversationAlerts);
  const [showAddAlertDialog, setShowAddAlertDialog] = useState(false);
  const [newConvAlert, setNewConvAlert] = useState<ConversationAlert>({
    id: 0,
    type: 'Pico de mensagens',
    team: '',
    startDate: '',
    endDate: '',
    severity: 'moderada',
    description: '',
  });

  /* ===== SUPABASE: buscar KPIs ===== */
  async function fetchKpis() {
    try {
      // Total de contatos
      const { count: totalCont, error: e1 } = await supabase
        .from('contatos_luna')
        .select('*', { count: 'exact', head: true });
      if (e1) throw e1;
      setTotalContacts(totalCont ?? 0);

      // Total de mensagens
      const { count: totalMsg, error: e2 } = await supabase
        .from('logsluna')
        .select('*', { count: 'exact', head: true });
      if (e2) throw e2;
      setTotalMessages(totalMsg ?? 0);

      // Conversas atendidas (placeholder → ajuste conforme sua lógica)
      setAttendedConversations(totalMsg ?? 0);

      // Contatos ativos (distintos em logsluna)
      const { data: logs, error: elog } = await supabase
        .from('logsluna')
        .select('*');
      if (elog) throw elog;

      let active = 0;
      if (logs && logs.length) {
        const sample = logs[0] as any;
        const key =
          'contact_id' in sample ? 'contact_id' :
          'contato_id' in sample ? 'contato_id' :
          null;

        if (key) {
          const setIds = new Set(logs.map((r: any) => r[key]).filter(Boolean));
          active = setIds.size;
        }
      }
      setActiveContacts(active);
    } catch (err) {
      console.error('Erro ao buscar KPIs no Supabase:', err);
    }
  }

  /* ===== realtime: atualiza sozinho ===== */
  useEffect(() => {
    fetchKpis();

    const ch = supabase
      .channel('kpis')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contatos_luna' }, fetchKpis)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'logsluna' }, fetchKpis)
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  return (
    <div className="p-6 space-y-6 animate-enter">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">
            <EditableField value={title} onSave={(value) => setTitle(String(value))} className="inline-block" showEditIcon />
          </h1>
          <p className="text-muted-foreground">
            <EditableField value={description} onSave={(value) => setDescription(String(value))} className="inline-block" showEditIcon />
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 text-sm text-agri-primary font-medium bg-agri-primary/10 rounded-lg hover:bg-agri-primary/20 transition-colors">
            <Calendar className="h-4 w-4 inline mr-2" />
            <EditableField value={currentMonth} onSave={(value) => setCurrentMonth(String(value))} className="inline-block" />
          </button>
          <button
            className="px-4 py-2 text-sm bg-agri-primary text-white rounded-lg hover:bg-agri-primary-dark transition-colors"
          >
            <Wallet className="h-4 w-4 inline mr-2" />
            Nova Conversa
          </button>
        </div>
      </header>

      {/* ====== CARDS RÁPIDOS ====== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total de Contatos 👥 */}
        <div className="stat-card card-hover">
          <p className="stat-label">Total de Contatos 👥</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value">{totalContacts}</p>
            <span className="text-agri-success text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />+{contactsGrowth}%
            </span>
          </div>
        </div>

        {/* Contatos Ativos 🟢 */}
        <div className="stat-card card-hover">
          <p className="stat-label">Contatos Ativos 🟢</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value">{activeContacts}</p>
            <span className="text-agri-primary text-sm font-medium">{newContacts} novos</span>
          </div>
        </div>

        {/* Conversas Atendidas 💬 */}
        <div className="stat-card card-hover">
          <p className="stat-label">Conversas Atendidas 💬</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value">{attendedConversations}</p>
            <span className="text-agri-success text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />+{conversationsGrowth}%
            </span>
          </div>
        </div>

        {/* Total de Mensagens ✉️ */}
        <div className="stat-card card-hover">
          <p className="stat-label">Total de Mensagens ✉️</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value">{totalMessages}</p>
            <span className="text-agri-warning text-sm font-medium flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" /> Recentes
            </span>
          </div>
        </div>
      </div>

      {/* ... resto igual aos gráficos, tarefas, alertas ... */}
    </div>
  );
};

export default Dashboard;
