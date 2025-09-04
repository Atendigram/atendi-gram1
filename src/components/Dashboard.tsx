import React, { useState, useEffect } from "react";
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
import { supabase } from "../integrations/supabase/client"; // cliente supabase

/* -------------------------------------------------------------
   Gráficos de exemplo
-------------------------------------------------------------- */
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

/* Alertas de Conversa */
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
];

/* ----------------------------------------------------------------
   DASHBOARD
----------------------------------------------------------------- */
const Dashboard = () => {
  const [title, setTitle] = useState("Olá, Atendente 👋");
  const [description, setDescription] = useState(
    "Aqui está uma visão geral do seu atendimento no AtendiGram"
  );
  const [currentMonth, setCurrentMonth] = useState("Agosto 2023");

  // ====== CARDS ======
  const [totalContacts, setTotalContacts] = useState(0);
  const [attendedConversations, setAttendedConversations] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);

  // ====== Alertas de Conversa ======
  const [conversationAlerts, setConversationAlerts] = useState<
    ConversationAlert[]
  >(initialConversationAlerts);
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

  // ====== SUPABASE FETCH ======
  useEffect(() => {
    const fetchData = async () => {
      const thirtyDaysAgo = new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000
      ).toISOString();

      // Total de Contatos 👥
      const { count: contactsCount } = await supabase
        .from("contatos_luna")
        .select("*", { count: "exact", head: true })
        .gte("created_at", thirtyDaysAgo);
      setTotalContacts(contactsCount || 0);

      // Total de Mensagens ✉️
      const { count: messagesCount } = await supabase
        .from("logsluna")
        .select("*", { count: "exact", head: true })
        .gte("created_at", thirtyDaysAgo);
      setTotalMessages(messagesCount || 0);

      // Conversas Atendidas 💬 (conversation_id únicos)
      const { data: conversationsData } = await supabase
        .from("logsluna")
        .select("conversation_id")
        .gte("created_at", thirtyDaysAgo);

      if (conversationsData) {
        const uniqueConversations = new Set(
          conversationsData.map((item) => item.conversation_id)
        );
        setAttendedConversations(uniqueConversations.size);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  // ====== RENDER ======
  return (
    <div className="p-6 space-y-6 animate-enter">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">
            <EditableField
              value={title}
              onSave={(v) => setTitle(String(v))}
              className="inline-block"
              showEditIcon
            />
          </h1>
          <p className="text-muted-foreground">
            <EditableField
              value={description}
              onSave={(v) => setDescription(String(v))}
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
              onSave={(v) => setCurrentMonth(String(v))}
              className="inline-block"
            />
          </button>
          <button className="px-4 py-2 text-sm bg-agri-primary text-white rounded-lg hover:bg-agri-primary-dark transition-colors">
            <Wallet className="h-4 w-4 inline mr-2" />
            Nova Conversa
          </button>
        </div>
      </header>

      {/* ====== CARDS ====== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="stat-card card-hover">
          <p className="stat-label">Total de Contatos 👥</p>
          <p className="stat-value">{totalContacts}</p>
        </div>
        <div className="stat-card card-hover">
          <p className="stat-label">Conversas Atendidas 💬</p>
          <p className="stat-value">{attendedConversations}</p>
        </div>
        <div className="stat-card card-hover">
          <p className="stat-label">Total de Mensagens ✉️</p>
          <p className="stat-value">{totalMessages}</p>
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
          Acompanhe alertas que impactam seu atendimento.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Equipe</th>
                <th className="px-4 py-3 text-left">Período</th>
                <th className="px-4 py-3 text-left">Severidade</th>
                <th className="px-4 py-3 text-left">Descrição</th>
              </tr>
            </thead>
            <tbody>
              {conversationAlerts.map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="px-4 py-2">{a.type}</td>
                  <td className="px-4 py-2">{a.team}</td>
                  <td className="px-4 py-2">
                    {a.startDate} → {a.endDate}
                  </td>
                  <td className="px-4 py-2">{a.severity}</td>
                  <td className="px-4 py-2">{a.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
