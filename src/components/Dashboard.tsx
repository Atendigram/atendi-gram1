import React, { useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  CloudRain,
  Wind,
  Calendar,
  Wallet,
  Trash2,
  Plus,
  X,
  Check,
  Edit,
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

// --- Dados de exemplo (gráficos) ---
const revenueData = [
  { month: 'Jan', revenue: 1500 },
  { month: 'Fev', revenue: 2200 },
  { month: 'Mar', revenue: 2500 },
  { month: 'Abr', revenue: 2800 },
  { month: 'Mai', revenue: 3200 },
  { month: 'Jun', revenue: 3500 },
  { month: 'Jul', revenue: 4000 },
];

const contactsDistribution = [
  { name: 'Leads', value: 40 },
  { name: 'Clientes', value: 25 },
  { name: 'Suporte', value: 15 },
  { name: 'Parcerias', value: 10 },
  { name: 'Outros', value: 10 },
];

// --- Tarefas (exemplo) ---
const initialUpcomingTasks = [
  { id: 1, title: 'Responder novos leads no Telegram', due: 'Hoje', priority: 'high' },
  { id: 2, title: 'Configurar mensagem automática', due: 'Amanhã', priority: 'medium' },
  { id: 3, title: 'Revisar tags dos contatos', due: '28/08', priority: 'low' },
  { id: 4, title: 'Organizar funil de atendimento', due: '30/08', priority: 'medium' },
];

// --- Alertas (exemplo) ---
const initialAlerts = [
  { id: 1, message: 'Fila de mensagens acima do normal', type: 'warning' },
  { id: 2, message: 'Taxa de resposta caiu nas últimas 24h', type: 'danger' },
  { id: 3, message: 'Integração com Supabase OK', type: 'info' },
];

// --- “Alertas de conversa” (tabela) ---
const initialConversationAlerts = [
  {
    id: 1,
    type: 'Pico de mensagens',
    region: 'Todos os canais',
    startDate: '2023-09-10',
    endDate: '2023-09-12',
    severity: 'crítica',
    description: 'Grande volume de mensagens entrando',
  },
  {
    id: 2,
    type: 'Queda de resposta',
    region: 'Equipe Suporte',
    startDate: '2023-09-20',
    endDate: '2023-09-23',
    severity: 'moderada',
    description: 'Tempo médio de resposta acima do esperado',
  },
];

const Dashboard = () => {
  // Títulos do topo
  const [title, setTitle] = useState('Olá, Atendente');
  const [description, setDescription] = useState('Aqui está uma visão geral do seu atendimento no AtendiGram');
  const [currentMonth, setCurrentMonth] = useState('Agosto 2023');

  // Cards principais
  const [monthlyRevenue, setMonthlyRevenue] = useState(15450);
  const [revenueGrowth, setRevenueGrowth] = useState(8.5);
  const [activeContacts, setActiveContacts] = useState(35);
  const [newContacts, setNewContacts] = useState(5);
  const [handledConversations, setHandledConversations] = useState(75);
  const [handledGrowth, setHandledGrowth] = useState(5.2);
  const [alertsCount, setAlertsCount] = useState(3);

  // Tarefas / alertas simples
  const [upcomingTasks, setUpcomingTasks] = useState(initialUpcomingTasks);
  const [alerts, setAlerts] = useState(initialAlerts);

  // Tabela de “Alertas de Conversa”
  const [conversationAlerts, setConversationAlerts] = useState(initialConversationAlerts);

  // Modal novo alerta
  const [showAddAlertDialog, setShowAddAlertDialog] = useState(false);
  const [newAlert, setNewAlert] = useState({
    type: 'Pico de mensagens',
    region: '',
    startDate: '',
    endDate: '',
    severity: 'moderada',
    description: '',
  });

  // Edição de tarefa
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [editedTaskTitle, setEditedTaskTitle] = useState('');

  // Handlers (títulos/descrição/mês)
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
    toast.success('Período atualizado');
  };

  // Handlers dos cards
  const handleRevenueChange = (value: string | number) => {
    setMonthlyRevenue(Number(value));
    toast.success('Faturamento atualizado');
  };
  const handleRevenueGrowthChange = (value: string | number) => {
    setRevenueGrowth(Number(value));
    toast.success('Variação do faturamento atualizada');
  };
  const handleActiveContactsChange = (value: string | number) => {
    setActiveContacts(Number(value));
    toast.success('Contatos ativos atualizado');
  };
  const handleNewContactsChange = (value: string | number) => {
    setNewContacts(Number(value));
    toast.success('Novos contatos atualizado');
  };
  const handleHandledChange = (value: string | number) => {
    setHandledConversations(Number(value));
    toast.success('Conversas atendidas atualizado');
  };
  const handleHandledGrowthChange = (value: string | number) => {
    setHandledGrowth(Number(value));
    toast.success('Variação do atendimento atualizada');
  };

  // Tarefas
  const handleEditTask = (taskId: number) => {
    const task = upcomingTasks.find((t) => t.id === taskId);
    if (task) {
      setEditingTask(taskId);
      setEditedTaskTitle(task.title);
    }
  };
  const handleSaveTask = (taskId: number) => {
    if (!editedTaskTitle.trim()) return;
    setUpcomingTasks((t) => t.map((task) => (task.id === taskId ? { ...task, title: editedTaskTitle } : task)));
    setEditingTask(null);
    toast.success('Tarefa atualizada');
  };
  const handleDeleteTask = (taskId: number) => {
    setUpcomingTasks((t) => t.filter((task) => task.id !== taskId));
    toast.success('Tarefa removida');
  };

  // Alertas “simples”
  const handleEditAlert = (id: number, message: string) => {
    setAlerts((a) => a.map((al) => (al.id === id ? { ...al, message } : al)));
    toast.success('Alerta atualizado');
  };
  const handleDeleteAlert = (id: number) => {
    setAlerts((a) => a.filter((al) => al.id !== id));
    setAlertsCount((prev) => prev - 1);
    toast.success('Alerta removido');
  };

  // Alertas de Conversa (tabela)
  const handleDeleteConversationAlert = (id: number) => {
    setConversationAlerts((a) => a.filter((al) => al.id !== id));
    toast.success('Alerta de conversa removido');
  };
  const handleAddConversationAlert = () => {
    const { region, startDate, endDate, description } = newAlert;
    if (!region || !startDate || !endDate || !description) {
      toast.error('Preencha todos os campos');
      return;
    }
    const newId = Math.max(0, ...conversationAlerts.map((a) => a.id)) + 1;
    setConversationAlerts((a) => [...a, { id: newId, ...newAlert }]);
    setShowAddAlertDialog(false);
    setNewAlert({
      type: 'Pico de mensagens',
      region: '',
      startDate: '',
      endDate: '',
      severity: 'moderada',
      description: '',
    });
    toast.success('Novo alerta de conversa adicionado');
  };

  // CTA do topo
  const handleNewConversation = () => {
    toast.info('Abrir criação de nova conversa…');
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
            onClick={handleNewConversation}
          >
            <Wallet className="h-4 w-4 inline mr-2" />
            Nova Conversa
          </button>
        </div>
      </header>

      {/* Cards principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card card-hover">
          <p className="stat-label">Faturamento Mensal</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value">
              <EditableField value={monthlyRevenue} type="number" onSave={handleRevenueChange} className="inline-block font-bold" /> R$
            </p>
            <span className="text-agri-success text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" /> +
              <EditableField value={revenueGrowth} type="number" onSave={handleRevenueGrowthChange} className="inline-block" />%
            </span>
          </div>
        </div>

        <div className="stat-card card-hover">
          <p className="stat-label">Contatos Ativos</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value">
              <EditableField value={activeContacts} type="number" onSave={handleActiveContactsChange} className="inline-block font-bold" />
            </p>
            <span className="text-agri-primary text-sm font-medium">
              <EditableField value={newContacts} type="number" onSave={handleNewContactsChange} className="inline-block" /> novos
            </span>
          </div>
        </div>

        <div className="stat-card card-hover">
          <p className="stat-label">Conversas Atendidas</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value">
              <EditableField value={handledConversations} type="number" onSave={handleHandledChange} className="inline-block font-bold" />
            </p>
            <span className="text-agri-success text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" /> +
              <EditableField value={handledGrowth} type="number" onSave={handleHandledGrowthChange} className="inline-block" />%
            </span>
          </div>
        </div>

        <div className="stat-card card-hover">
          <p className="stat-label">Alertas</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value">{alertsCount}</p>
            <span className="text-agri-warning text-sm font-medium flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" /> Recentes
            </span>
          </div>
        </div>
      </div>

      {/* Alertas de Conversa */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Alertas de Conversa</h2>
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
                  <td className="px-4 py-3">{alert.type}</td>
                  <td className="px-4 py-3">
                    <EditableField
                      value={alert.region}
                      onSave={(value) => {
                        setConversationAlerts((a) => a.map((al) => (al.id === alert.id ? { ...al, region: String(value) } : al)));
                        toast.success('Equipe/Canais atualizado');
                      }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <div>
                        <span className="text-xs text-muted-foreground">Início:</span>{' '}
                        <EditableField
                          value={alert.startDate}
                          type="date"
                          onSave={(value) => {
                            setConversationAlerts((a) => a.map((al) => (al.id === alert.id ? { ...al, startDate: String(value) } : al)));
                            toast.success('Data inicial atualizada');
                          }}
                        />
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Fim:</span>{' '}
                        <EditableField
                          value={alert.endDate}
                          type="date"
                          onSave={(value) => {
                            setConversationAlerts((a) => a.map((al) => (al.id === alert.id ? { ...al, endDate: String(value) } : al)));
                            toast.success('Data final atualizada');
                          }}
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
                        onSave={(value) => {
                          setConversationAlerts((a) => a.map((al) => (al.id === alert.id ? { ...al, severity: String(value) } : al)));
                          toast.success('Severidade atualizada');
                        }}
                      />
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <EditableField
                      value={alert.description}
                      onSave={(value) => {
                        setConversationAlerts((a) => a.map((al) => (al.id === alert.id ? { ...al, description: String(value) } : al)));
                        toast.success('Descrição atualizada');
                      }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteConversationAlert(alert.id)}
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

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="dashboard-card col-span-full lg:col-span-2 card-hover">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Gráfico de Faturamento</h3>
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
                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `R$ ${v}`} />
                <Tooltip formatter={(v) => [`R$ ${v}`, 'Faturamento']} />
                <Area type="monotone" dataKey="revenue" stroke="#4CAF50" fillOpacity={1} fill="url(#colorRevenue)" activeDot={{ r: 8 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dashboard-card card-hover">
          <h3 className="font-semibold mb-4">Distribuição de Contatos</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contactsDistribution} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} />
                <XAxis type="number" axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={90} />
                <Tooltip formatter={(v) => [`${v}%`, 'Percentual']} />
                <Bar dataKey="value" fill="#8D6E63" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tarefas / Alertas do Sistema */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="dashboard-card card-hover">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Tarefas Pendentes</h3>
            <button className="text-xs text-agri-primary hover:underline">Ver tudo</button>
          </div>

          <div className="space-y-3">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-center p-2 rounded-lg hover:bg-muted">
                <div
                  className={`w-2 h-2 rounded-full mr-3 ${
                    task.priority === 'high' ? 'bg-agri-danger' : task.priority === 'medium' ? 'bg-agri-warning' : 'bg-agri-success'
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
                <div className="flex">
                  {editingTask !== task.id && (
                    <>
                      <button className="p-1.5 hover:bg-muted rounded" onClick={() => handleEditTask(task.id)}>
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button className="p-1.5 hover:bg-muted rounded text-red-500" onClick={() => handleDeleteTask(task.id)}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {upcomingTasks.length === 0 && (
              <p className="text-center text-muted-foreground py-4">Nenhuma tarefa pendente</p>
            )}
          </div>
        </div>

        <div className="dashboard-card card-hover">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Alertas do Sistema</h3>
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
                      onSave={(value) => handleEditAlert(alert.id, String(value))}
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

      {/* Modal: Novo Alerta de Conversa */}
      <Dialog open={showAddAlertDialog} onOpenChange={setShowAddAlertDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Alerta de Conversa</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="alertType" className="text-right">
                Tipo
              </Label>
              <select
                id="alertType"
                value={newAlert.type}
                onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value })}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="Pico de mensagens">Pico de mensagens</option>
                <option value="Queda de resposta">Queda de resposta</option>
                <option value="Canal indisponível">Canal indisponível</option>
              </select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="region" className="text-right">
                Equipe/Canais
              </Label>
              <Input
                id="region"
                value={newAlert.region}
                onChange={(e) => setNewAlert({ ...newAlert, region: e.target.value })}
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
                value={newAlert.startDate}
                onChange={(e) => setNewAlert({ ...newAlert, startDate: e.target.value })}
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
                value={newAlert.endDate}
                onChange={(e) => setNewAlert({ ...newAlert, endDate: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="severity" className="text-right">
                Severidade
              </Label>
              <select
                id="severity"
                value={newAlert.severity}
                onChange={(e) => setNewAlert({ ...newAlert, severity: e.target.value })}
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
                value={newAlert.description}
                onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAlertDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddConversationAlert}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
