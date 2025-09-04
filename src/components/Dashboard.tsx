import React, { useState } from 'react';
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

/* Tarefas (UI/local) */
const initialUpcomingTasks = [
  { id: 1, title: 'Récolter la canne à sucre', due: "Aujourd'hui", priority: 'high' },
  { id: 2, title: 'Commander des plants de bananier', due: 'Demain', priority: 'medium' },
  { id: 3, title: 'Maintenance du tracteur', due: '28/08', priority: 'low' },
  { id: 4, title: "Irrigation des plantations d'ananas", due: '30/08', priority: 'medium' },
];

/* Alertas do card lateral (UI/local) */
const initialAlerts = [
  { id: 1, message: 'Niveau bas de plants de bananier', type: 'warning' },
  { id: 2, message: 'Risque cyclonique pour la semaine prochaine', type: 'danger' },
  { id: 3, message: 'Échéance de subvention régionale approche', type: 'info' },
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
  // 1) Total de Contatos 👥
  const [totalContacts, setTotalContacts] = useState(15450);
  const [contactsGrowth, setContactsGrowth] = useState(8.5);

  // 2) Contatos Ativos 🟢
  const [activeContacts, setActiveContacts] = useState(35);
  const [newContacts, setNewContacts] = useState(5);

  // 3) Conversas Atendidas 💬
  const [attendedConversations, setAttendedConversations] = useState(75);
  const [conversationsGrowth, setConversationsGrowth] = useState(5.2);

  // 4) Total de Mensagens ✉️ (número simples)
  const [totalMessages, setTotalMessages] = useState(3);

  /* Tarefas e alertas (cards de baixo) */
  const [upcomingTasks, setUpcomingTasks] = useState(initialUpcomingTasks);
  const [alerts, setAlerts] = useState(initialAlerts);

  /* ===== tabela: Alertas de Conversa ===== */
  const [conversationAlerts, setConversationAlerts] = useState<ConversationAlert[]>(
    initialConversationAlerts
  );

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

  /* ===== handlers de edição ===== */
  const handleTitleChange = (value: string | number) => {
    setTitle(String(value));
    toast.success('Título atualizado');
  };

  const handleDescriptionChange = (value: string | number) => {
    setDescription(String(value));
    toast.success('Descrição atualizada');
  };

  const handleMonthChange = (value: string | number) => {
    setCurrentMonth(String(value));
    toast.success('Mês atualizado');
  };

  // Card 1
  const handleTotalContactsChange = (value: string | number) => {
    setTotalContacts(Number(value));
    toast.success('Total de contatos atualizado');
  };

  // Card 2
  const handleActiveContactsChange = (value: string | number) => {
    setActiveContacts(Number(value));
    toast.success('Contatos ativos atualizado');
  };
  const handleNewContactsChange = (value: string | number) => {
    setNewContacts(Number(value));
    toast.success('Novos contatos atualizado');
  };

  // Card 3
  const handleAttendedChange = (value: string | number) => {
    setAttendedConversations(Number(value));
    toast.success('Conversas atendidas atualizado');
  };
  const handleAttendedGrowthChange = (value: string | number) => {
    setConversationsGrowth(Number(value));
    toast.success('Variação de conversas atualizada');
  };

  /* ===== tarefas ===== */
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [editedTaskTitle, setEditedTaskTitle] = useState('');

  const handleEditTask = (taskId: number) => {
    const task = upcomingTasks.find((t) => t.id === taskId);
    if (task) {
      setEditingTask(taskId);
      setEditedTaskTitle(task.title);
    }
  };

  const handleSaveTask = (taskId: number) => {
    if (editedTaskTitle.trim() === '') return;
    setUpcomingTasks(
      upcomingTasks.map((task) => (task.id === taskId ? { ...task, title: editedTaskTitle } : task))
    );
    setEditingTask(null);
    toast.success('Tarefa atualizada');
  };

  const handleDeleteTask = (taskId: number) => {
    setUpcomingTasks(upcomingTasks.filter((task) => task.id !== taskId));
    toast.success('Tarefa removida');
  };

  /* ===== alertas do card da direita ===== */
  const handleEditAlert = (id: number, message: string) => {
    setAlerts(alerts.map((a) => (a.id === id ? { ...a, message } : a)));
    toast.success('Alerta atualizado');
  };

  const handleDeleteAlert = (id: number) => {
    setAlerts(alerts.filter((a) => a.id !== id));
    toast.success('Alerta removido');
  };

  /* ===== alertas de conversa (tabela) ===== */
  const addConversationAlert = () => {
    const { team, startDate, endDate, description } = newConvAlert;
    if (!team || !startDate || !endDate || !description) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    const newId = Math.max(0, ...conversationAlerts.map((a) => a.id)) + 1;
    setConversationAlerts([...conversationAlerts, { ...newConvAlert, id: newId }]);
    setShowAddAlertDialog(false);
    setNewConvAlert({
      id: 0,
      type: 'Pico de mensagens',
      team: '',
      startDate: '',
      endDate: '',
      severity: 'moderada',
      description: '',
    });
    toast.success('Novo alerta de conversa adicionado');
  };

  const deleteConversationAlert = (id: number) => {
    setConversationAlerts(conversationAlerts.filter((a) => a.id !== id));
    toast.success('Alerta removido');
  };

  /* ===== ação fictícia ===== */
  const handleAddTransaction = () => {
    toast.info('Redirecionando para Finanças…');
  };

  return (
    <div className="p-6 space-y-6 animate-enter">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">
            <EditableField value={title} onSave={handleTitleChange} className="inline-block" showEditIcon />
          </h1>
          <p className="text-muted-foreground">
            <EditableField value={description} onSave={handleDescriptionChange} className="inline-block" showEditIcon />
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 text-sm text-agri-primary font-medium bg-agri-primary/10 rounded-lg hover:bg-agri-primary/20 transition-colors">
            <Calendar className="h-4 w-4 inline mr-2" />
            <EditableField value={currentMonth} onSave={handleMonthChange} className="inline-block" />
          </button>
          <button
            className="px-4 py-2 text-sm bg-agri-primary text-white rounded-lg hover:bg-agri-primary-dark transition-colors"
            onClick={handleAddTransaction}
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
            <p className="stat-value">
              <EditableField
                value={totalContacts}
                type="number"
                onSave={handleTotalContactsChange}
                className="inline-block font-bold"
              />
            </p>
            <span className="text-agri-success text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" /> +
              <EditableField
                value={contactsGrowth}
                type="number"
                onSave={(v) => {
                  setContactsGrowth(Number(v));
                  toast.success('Variação atualizada');
                }}
                className="inline-block"
              />
              %
            </span>
          </div>
        </div>

        {/* Contatos Ativos 🟢 */}
        <div className="stat-card card-hover">
          <p className="stat-label">Contatos Ativos 🟢</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value">
              <EditableField
                value={activeContacts}
                type="number"
                onSave={handleActiveContactsChange}
                className="inline-block font-bold"
              />
            </p>
            <span className="text-agri-primary text-sm font-medium">
              <EditableField
                value={newContacts}
                type="number"
                onSave={handleNewContactsChange}
                className="inline-block"
              />{' '}
              novos
            </span>
          </div>
        </div>

        {/* Conversas atendidas 💬🟢 */}
        <div className="stat-card card-hover">
          <p className="stat-label">Conversas Atendidas 💬</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value">
              <EditableField
                value={attendedConversations}
                type="number"
                onSave={handleAttendedChange}
                className="inline-block font-bold"
              />
            </p>
            <span className="text-agri-success text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" /> +
              <EditableField
                value={conversationsGrowth}
                type="number"
                onSave={handleAttendedGrowthChange}
                className="inline-block"
              />
              %
            </span>
          </div>
        </div>

        {/* Total de Mensagens ✉️ */}
        <div className="stat-card card-hover">
          <p className="stat-label">Total de Mensagens ✉️</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value">
              <EditableField
                value={totalMessages}
                type="number"
                onSave={(v) => {
                  setTotalMessages(Number(v));
                  toast.success('Total de mensagens atualizado');
                }}
                className="inline-block font-bold"
              />
            </p>
            <span className="text-agri-warning text-sm font-medium flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" /> Recentes
            </span>
          </div>
        </div>
      </div>

      {/* ====== ALERTAS DE CONVERSA ====== */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Alertas de Conversa 💬</h2>
          <Button onClick={() => setShowAddAlertDialog(true)} className="bg-agri-primary hover:bg-agri-primary-dark">
            <Plus size={16} className="mr-2" /> Novo Alerta
          </Button>
        </div>
        <p className="text-muted-foreground mb-6">
          Acompanhe alertas que impactam seu atendimento (picos, quedas e desempenho das equipes).
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Equipe/Canais</th>
                <th className="px-4 py-3 text-left">Período</th>
                <th className="px-4 py-3 text-left">Severidade</th>
                <th className="px-4 py-3 text-left">Descrição</th>
                <th className="px-4 py-3 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {conversationAlerts.map((alert) => (
                <tr key={alert.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3 flex items-center gap-2">
                    {alert.type === 'Pico de mensagens' ? (
                      <ArrowUpRight size={16} className="text-agri-danger" />
                    ) : alert.type === 'Queda de resposta' ? (
                      <ArrowDownRight size={16} className="text-agri-warning" />
                    ) : (
                      <AlertTriangle size={16} className="text-muted-foreground" />
                    )}
                    <EditableField
                      value={alert.type}
                      onSave={(val) =>
                        setConversationAlerts(
                          conversationAlerts.map((a) =>
                            a.id === alert.id ? { ...a, type: String(val) as ConversationAlert['type'] } : a
                          )
                        )
                      }
                    />
                  </td>

                  <td className="px-4 py-3">
                    <EditableField
                      value={alert.team}
                      onSave={(val) =>
                        setConversationAlerts(
                          conversationAlerts.map((a) => (a.id === alert.id ? { ...a, team: String(val) } : a))
                        )
                      }
                    />
                  </td>

                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <div>
                        <span className="text-xs text-muted-foreground">Início:&nbsp;</span>
                        <EditableField
                          value={alert.startDate}
                          type="date"
                          onSave={(val) =>
                            setConversationAlerts(
                              conversationAlerts.map((a) =>
                                a.id === alert.id ? { ...a, startDate: String(val) } : a
                              )
                            )
                          }
                        />
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Fim:&nbsp;</span>
                        <EditableField
                          value={alert.endDate}
                          type="date"
                          onSave={(val) =>
                            setConversationAlerts(
                              conversationAlerts.map((a) =>
                                a.id === alert.id ? { ...a, endDate: String(val) } : a
                              )
                            )
                          }
                        />
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        alert.severity === 'crítica'
                          ? 'bg-red-100 text-red-800'
                          : alert.severity === 'moderada'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      <EditableField
                        value={alert.severity}
                        onSave={(val) =>
                          setConversationAlerts(
                            conversationAlerts.map((a) =>
                              a.id === alert.id ? { ...a, severity: String(val) as ConversationAlert['severity'] } : a
                            )
                          )
                        }
                      />
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <EditableField
                      value={alert.description}
                      onSave={(val) =>
                        setConversationAlerts(
                          conversationAlerts.map((a) =>
                            a.id === alert.id ? { ...a, description: String(val) } : a
                          )
                        )
                      }
                    />
                  </td>

                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteConversationAlert(alert.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-100"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))}

              {conversationAlerts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center text-muted-foreground">
                    Nenhum alerta de conversa no momento
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ====== Gráficos / listas ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Faturamento 📈 */}
        <div className="dashboard-card col-span-full lg:col-span-2 card-hover">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Gráfico de Faturamento 📈</h3>
            <div className="flex space-x-2">
              <button className="text-xs px-3 py-1.5 bg-muted rounded-md text-foreground">2023</button>
              <button className="text-xs px-3 py-1.5 text-muted-foreground hover:bg-muted rounded-md">2022</button>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4CAF50" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `${v} €`} />
                <Tooltip formatter={(v) => [`${v} €`, 'Valor']} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4CAF50"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  activeDot={{ r: 8 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribuição (placeholder) */}
        <div className="dashboard-card card-hover">
          <h3 className="font-semibold mb-4">Distribuição (exemplo) 🧭</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productionData} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} />
                <XAxis type="number" axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} />
                <Tooltip formatter={(value: any) => [`${value}%`, 'Percentual']} />
                <Bar dataKey="value" fill="#8D6E63" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tarefas e Alertas (cards inferiores) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tarefas a vir 📋 */}
        <div className="dashboard-card card-hover">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Tarefas a Vir 📋</h3>
            <button className="text-xs text-agri-primary hover:underline">Ver tudo</button>
          </div>

          <div className="space-y-3">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-center p-2 rounded-lg hover:bg-muted">
                <div
                  className={`w-2 h-2 rounded-full mr-3 ${
                    task.priority === 'high'
                      ? 'bg-agri-danger'
                      : task.priority === 'medium'
                      ? 'bg-agri-warning'
                      : 'bg-agri-success'
                  }`}
                />
                <div className="flex-1">
                  {editingTask === task.id ? (
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={editedTaskTitle}
                        onChange={(e) => setEditedTaskTitle(e.target.value)}
                        className="border rounded px-2 py-1 text-sm w-full"
                        autoFocus
                      />
                      <button onClick={() => handleSaveTask(task.id)} className="ml-2 p-1 text-green-600 hover:bg-green-50 rounded">
                        <Check className="h-4 w-4" />
                      </button>
                      <button onClick={() => setEditingTask(null)} className="ml-1 p-1 text-red-600 hover:bg-red-50 rounded">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">Prazo: {task.due}</p>
                    </>
                  )}
                </div>
                {editingTask !== task.id && (
                  <div className="flex">
                    <button className="p-1.5 hover:bg-muted rounded" onClick={() => handleEditTask(task.id)}>
                      <Edit className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button className="p-1.5 hover:bg-muted rounded text-red-500" onClick={() => handleDeleteTask(task.id)}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
            {upcomingTasks.length === 0 && (
              <p className="text-center text-muted-foreground py-4">Nenhuma tarefa a vir</p>
            )}
          </div>
        </div>

        {/* Alertas (laterais) 🚨 */}
        <div className="dashboard-card card-hover">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Alertas 🚨</h3>
            <button className="text-xs text-agri-primary hover:underline">Gerenciar alertas</button>
          </div>

          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg ${
                  alert.type === 'danger'
                    ? 'bg-agri-danger/10 border-l-4 border-agri-danger'
                    : alert.type === 'warning'
                    ? 'bg-agri-warning/10 border-l-4 border-agri-warning'
                    : 'bg-agri-info/10 border-l-4 border-agri-info'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start flex-1">
                    <AlertTriangle
                      className={`h-5 w-5 mr-2 ${
                        alert.type === 'danger'
                          ? 'text-agri-danger'
                          : alert.type === 'warning'
                          ? 'text-agri-warning'
                          : 'text-agri-info'
                      }`}
                    />
                    <EditableField
                      value={alert.message}
                      onSave={(val) => handleEditAlert(alert.id, String(val))}
                      className="text-sm"
                    />
                  </div>
                  <button
                    onClick={() => handleDeleteAlert(alert.id)}
                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {alerts.length === 0 && <p className="text-center text-muted-foreground py-4">Nenhum alerta ativo</p>}
          </div>
        </div>
      </div>

      {/* Dialog: novo Alerta de Conversa */}
      <Dialog open={showAddAlertDialog} onOpenChange={setShowAddAlertDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo alerta de conversa</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Tipo
              </Label>
              <select
                id="type"
                value={newConvAlert.type}
                onChange={(e) =>
                  setNewConvAlert({ ...newConvAlert, type: e.target.value as ConversationAlert['type'] })
                }
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="Pico de mensagens">Pico de mensagens</option>
                <option value="Queda de resposta">Queda de resposta</option>
                <option value="Outros">Outros</option>
              </select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="team" className="text-right">
                Equipe/Canais
              </Label>
              <Input
                id="team"
                value={newConvAlert.team}
                onChange={(e) => setNewConvAlert({ ...newConvAlert, team: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Início
              </Label>
              <Input
                id="startDate"
                type="date"
                value={newConvAlert.startDate}
                onChange={(e) => setNewConvAlert({ ...newConvAlert, startDate: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                Fim
              </Label>
              <Input
                id="endDate"
                type="date"
                value={newConvAlert.endDate}
                onChange={(e) => setNewConvAlert({ ...newConvAlert, endDate: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="severity" className="text-right">
                Severidade
              </Label>
              <select
                id="severity"
                value={newConvAlert.severity}
                onChange={(e) =>
                  setNewConvAlert({ ...newConvAlert, severity: e.target.value as ConversationAlert['severity'] })
                }
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="baixa">Baixa</option>
                <option value="moderada">Moderada</option>
                <option value="crítica">Crítica</option>
              </select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descrição
              </Label>
              <Input
                id="description"
                value={newConvAlert.description}
                onChange={(e) => setNewConvAlert({ ...newConvAlert, description: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAlertDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={addConversationAlert}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
