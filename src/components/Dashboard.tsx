// src/components/Dashboard.tsx
import React, { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
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
} from "recharts";
import { EditableField } from "./ui/editable-field";
import { Button } from "./ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

// 👉 ajuste o caminho se necessário
import { supabase } from "../lib/supabase";

/* ----------------------------------------------------------------
   Dados de exemplo (gráficos)
----------------------------------------------------------------- */
const revenueData = [
  { month: "Jan", revenue: 1500 },
  { month: "Fév", revenue: 2200 },
  { month: "Mar", revenue: 2500 },
  { month: "Avr", revenue: 2800 },
  { month: "Mai", revenue: 3200 },
  { month: "Juin", revenue: 3500 },
  { month: "Juil", revenue: 4000 },
];

const productionData = [
  { name: "Canne à Sucre", value: 40 },
  { name: "Banane", value: 25 },
  { name: "Ananas", value: 15 },
  { name: "Igname", value: 10 },
  { name: "Autre", value: 10 },
];

/* Tarefas (UI/local) */
const initialUpcomingTasks = [
  { id: 1, title: "Récolter la canne à sucre", due: "Aujourd'hui", priority: "high" },
  { id: 2, title: "Commander des plants de bananier", due: "Demain", priority: "medium" },
  { id: 3, title: "Maintenance du tracteur", due: "28/08", priority: "low" },
  { id: 4, title: "Irrigation des plantations d'ananas", due: "30/08", priority: "medium" },
];

/* Alertas do card lateral (UI/local) */
const initialAlerts = [
  { id: 1, message: "Niveau bas de plants de bananier", type: "warning" },
  { id: 2, message: "Risque cyclonique pour la semaine prochaine", type: "danger" },
  { id: 3, message: "Échéance de subvention régionale approche", type: "info" },
];

/* ===== Alertas de Conversa (tabela principal) ===== */
type ConversationAlert = {
  id: number;
  type: "Pico de mensagens" | "Queda de resposta" | "Outros";
  team: string;
  startDate: string;
  endDate: string;
  severity: "crítica" | "moderada" | "baixa";
  description: string;
};

const initialConversationAlerts: ConversationAlert[] = [
  {
    id: 1,
    type: "Pico de mensagens",
    team: "Todos os canais",
    startDate: "2023-09-09",
    endDate: "2023-09-11",
    severity: "crítica",
    description: "Grande volume de mensagens entrando",
  },
  {
    id: 2,
    type: "Queda de resposta",
    team: "Equipe Suporte",
    startDate: "2023-09-19",
    endDate: "2023-09-22",
    severity: "moderada",
    description: "Tempo médio de resposta acima do esperado",
  },
];

/* ------------------------------ helpers ------------------------------ */
function startOfDaysAgo(days: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function formatDelta(current: number, previous: number) {
  if (!previous) return "0.0%";
  const delta = ((current - previous) / previous) * 100;
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)}%`;
}

// Wrappers para consertar TS do EditableField (onSave espera string)
const onSaveString =
  (setter: React.Dispatch<React.SetStateAction<string>>) => (v: string) =>
    setter(v);
const onSaveNumber =
  (setter: React.Dispatch<React.SetStateAction<number>>) => (v: string) =>
    setter(Number(v));

const Dashboard = () => {
  /* Cabeçalho */
  const [title, setTitle] = useState("Olá, Atendente 👋");
  const [description, setDescription] = useState(
    "Aqui está uma visão geral do seu atendimento no AtendiGram"
  );
  const [currentMonth, setCurrentMonth] = useState("Agosto 2023");

  /* ====== CARDS (dados do Supabase) ====== */
  // Contatos (últimos 30 dias e período anterior)
  const [contacts30, setContacts30] = useState<number>(0);
  const [contactsPrev, setContactsPrev] = useState<number>(0);

  // Conversas atendidas — por enquanto manual/local
  const [attendedConversations, setAttendedConversations] = useState(75);
  const [conversationsGrowth, setConversationsGrowth] = useState(5.2);

  // Mensagens (últimos 30 dias e período anterior)
  const [messages30, setMessages30] = useState<number>(0);
  const [messagesPrev, setMessagesPrev] = useState<number>(0);

  /* Tarefas e alertas (cards de baixo) */
  const [upcomingTasks, setUpcomingTasks] = useState(initialUpcomingTasks);
  const [alerts, setAlerts] = useState(initialAlerts);

  /* ===== tabela: Alertas de Conversa ===== */
  const [conversationAlerts, setConversationAlerts] =
    useState<ConversationAlert[]>(initialConversationAlerts);

  const [showAddAlertDialog, setShowAddAlertDialog] = useState(false);
  const [newConvAlert, setNewConvAlert] = useState<ConversationAlert>({
    id: 0,
    type: "Pico de mensagens",
    team: "",
    startDate: "",
    endDate: "",
    severity: "moderada",
    description: "",
  });

  // Janelas de tempo
  const since30 = useMemo(() => startOfDaysAgo(30), []);
  const prevSince30 = useMemo(() => startOfDaysAgo(60), []);
  const prevUntil30 = useMemo(() => startOfDaysAgo(30), []);

  /* -------------------- Carregar dados do Supabase -------------------- */
  useEffect(() => {
    const load = async () => {
      // Contatos 30d
      const { count: contactsNow, error: e1 } = await supabase
        .from("contatos_luna")
        .select("*", { count: "exact", head: true })
        .gte("created_at", since30);
      if (e1) console.error("contatos (30d):", e1);
      setContacts30(contactsNow ?? 0);

      // Contatos 31–60d
      const { count: contactsBefore, error: e2 } = await supabase
        .from("contatos_luna")
        .select("*", { count: "exact", head: true })
        .gte("created_at", prevSince30)
        .lt("created_at", prevUntil30);
      if (e2) console.error("contatos (31–60d):", e2);
      setContactsPrev(contactsBefore ?? 0);

      // Mensagens 30d
      const { count: msgsNow, error: e3 } = await supabase
        .from("logs_luna")
        .select("*", { count: "exact", head: true })
        .gte("created_at", since30);
      if (e3) console.error("mensagens (30d):", e3);
      setMessages30(msgsNow ?? 0);

      // Mensagens 31–60d
      const { count: msgsBefore, error: e4 } = await supabase
        .from("logs_luna")
        .select("*", { count: "exact", head: true })
        .gte("created_at", prevSince30)
        .lt("created_at", prevUntil30);
      if (e4) console.error("mensagens (31–60d):", e4);
      setMessagesPrev(msgsBefore ?? 0);
    };

    load();
  }, [since30, prevSince30, prevUntil30]);

  /* ====================== handlers UI / edição ====================== */
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [editedTaskTitle, setEditedTaskTitle] = useState("");

  const handleEditTask = (taskId: number) => {
    const task = upcomingTasks.find((t) => t.id === taskId);
    if (task) {
      setEditingTask(taskId);
      setEditedTaskTitle(task.title);
    }
  };

  const handleSaveTask = (taskId: number) => {
    if (editedTaskTitle.trim() === "") return;
    setUpcomingTasks(
      upcomingTasks.map((task) =>
        task.id === taskId ? { ...task, title: editedTaskTitle } : task
      )
    );
    setEditingTask(null);
    toast.success("Tarefa atualizada");
  };

  const handleDeleteTask = (taskId: number) => {
    setUpcomingTasks(upcomingTasks.filter((task) => task.id !== taskId));
    toast.success("Tarefa removida");
  };

  const handleEditAlert = (id: number, message: string) => {
    setAlerts(alerts.map((a) => (a.id === id ? { ...a, message } : a)));
    toast.success("Alerta atualizado");
  };

  const handleDeleteAlert = (id: number) => {
    setAlerts(alerts.filter((a) => a.id !== id));
    toast.success("Alerta removido");
  };

  const addConversationAlert = () => {
    const { team, startDate, endDate, description } = newConvAlert;
    if (!team || !startDate || !endDate || !description) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    const newId = Math.max(0, ...conversationAlerts.map((a) => a.id)) + 1;
    setConversationAlerts([...conversationAlerts, { ...newConvAlert, id: newId }]);
    setShowAddAlertDialog(false);
    setNewConvAlert({
      id: 0,
      type: "Pico de mensagens",
      team: "",
      startDate: "",
      endDate: "",
      severity: "moderada",
      description: "",
    });
    toast.success("Novo alerta de conversa adicionado");
  };

  const handleAddTransaction = () => {
    toast.info("Redirecionando para Finanças…");
  };

  // Deltas calculados
  const contactsDelta = formatDelta(contacts30, contactsPrev);
  const messagesDelta = formatDelta(messages30, messagesPrev);

  return (
    <div className="p-6 space-y-6 animate-enter">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">
            <EditableField
              value={title}
              onSave={onSaveString(setTitle)}
              className="inline-block"
              showEditIcon
            />
          </h1>
          <p className="text-muted-foreground">
            <EditableField
              value={description}
              onSave={onSaveString(setDescription)}
              className="inline-block"
              showEditIcon
            />
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 text-sm text-agri-primary font-medium bg-agri-primary/10 rounded-lg hover:bg-agri-primary/20 transition-colors">
            <Calendar className="h-4 w-4 inline mr-2" />
            <EditableField
              value={currentMonth}
              onSave={onSaveString(setCurrentMonth)}
              className="inline-block"
            />
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
        {/* Total de Contatos (30d) 👥 */}
        <div className="stat-card card-hover">
          <p className="stat-label">
            Total de Contatos 👥{" "}
            <span className="text-muted-foreground">(últimos 30 dias)</span>
          </p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value">{contacts30}</p>
            <span className="text-agri-success text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              {contactsDelta}
            </span>
          </div>
        </div>

        {/* Contatos Ativos (manual por enquanto) 🟢 */}
        <div className="stat-card card-hover">
          <p className="stat-label">Contatos Ativos 🟢</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value">
              <EditableField value={0} type="number" onSave={() => {}} className="inline-block font-bold" />
            </p>
            <span className="text-agri-primary text-sm font-medium">
              <EditableField value={5} type="number" onSave={() => {}} className="inline-block" />{" "}
              novos
            </span>
          </div>
        </div>

        {/* Conversas atendidas 💬 (últimos 30 dias – rótulo) */}
        <div className="stat-card card-hover">
          <p className="stat-label">
            Conversas Atendidas 💬{" "}
            <span className="text-muted-foreground">(últimos 30 dias)</span>
          </p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value">
              <EditableField
                value={attendedConversations}
                type="number"
                onSave={onSaveNumber(setAttendedConversations)}
                className="inline-block font-bold"
              />
            </p>
            <span className="text-agri-success text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              <EditableField
                value={conversationsGrowth}
                type="number"
                onSave={(v) => {
                  setConversationsGrowth(Number(v));
                  toast.success("Variação de conversas atualizada");
                }}
                className="inline-block"
              />
              %
            </span>
          </div>
        </div>

        {/* Total de Mensagens (30d) ✉️ */}
        <div className="stat-card card-hover">
          <p className="stat-label">
            Total de Mensagens ✉️{" "}
            <span className="text-muted-foreground">(últimos 30 dias)</span>
          </p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value">{messages30}</p>
            <span className="text-agri-success text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              {messagesDelta}
            </span>
          </div>
        </div>
      </div>

      {/* ====== ALERTAS DE CONVERSA ====== */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Alertas de Conversa 💬</h2>
          <Button
            onClick={() => setShowAddAlertDialog(true)}
            className="bg-agri-primary hover:bg-agri-primary-dark"
          >
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
                    {alert.type === "Pico de mensagens" ? (
                      <ArrowUpRight size={16} className="text-agri-danger" />
                    ) : alert.type === "Queda de resposta" ? (
                      <ArrowDownRight size={16} className="text-agri-warning" />
                    ) : (
                      <AlertTriangle size={16} className="text-muted-foreground" />
                    )}
                    <EditableField
                      value={alert.type}
                      onSave={(val) =>
                        setConversationAlerts(
                          conversationAlerts.map((a) =>
                            a.id === alert.id
                              ? { ...a, type: String(val) as ConversationAlert["type"] }
                              : a
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
                          conversationAlerts.map((a) =>
                            a.id === alert.id ? { ...a, team: String(val) } : a
                          )
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
                        alert.severity === "crítica"
                          ? "bg-red-100 text-red-800"
                          : alert.severity === "moderada"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      <EditableField
                        value={alert.severity}
                        onSave={(val) =>
                          setConversationAlerts(
                            conversationAlerts.map((a) =>
                              a.id === alert.id
                                ? {
                                    ...a,
                                    severity: String(val) as ConversationAlert["severity"],
                                  }
                                : a
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
                      onClick={() => {
                        setConversationAlerts(
                          conversationAlerts.filter((a) => a.id !== alert.id)
                        );
                        toast.success("Alerta removido");
                      }}
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
              <button className="text-xs px-3 py-1.5 bg-muted rounded-md text-foreground">
                2023
              </button>
              <button className="text-xs px-3 py-1.5 text-muted-foreground hover:bg-muted rounded-md">
                2022
              </button>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribuição (placeholder) */}
        <div className="dashboard-card card-hover">
          <h3 className="font-semibold mb-4">Distribuição (exemplo) 🧭</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={productionData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} />
                <XAxis type="number" axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
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
                  setNewConvAlert({
                    ...newConvAlert,
                    type: e.target.value as ConversationAlert["type"],
                  })
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
                onChange={(e) =>
                  setNewConvAlert({ ...newConvAlert, team: e.target.value })
                }
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
                onChange={(e) =>
                  setNewConvAlert({ ...newConvAlert, startDate: e.target.value })
                }
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
                onChange={(e) =>
                  setNewConvAlert({ ...newConvAlert, endDate: e.target.value })
                }
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
                  setNewConvAlert({
                    ...newConvAlert,
                    severity: e.target.value as ConversationAlert["severity"],
                  })
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
                onChange={(e) =>
                  setNewConvAlert({ ...newConvAlert, description: e.target.value })
                }
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
