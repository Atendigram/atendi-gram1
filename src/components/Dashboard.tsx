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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { supabase } from "../integrations/supabase/client";

/* Função utilitária para cálculo da % */
function calcularPercentual(
  atual: number,
  anterior: number,
  diasDisponiveis: number,
  janela: number = 30
) {
  if (anterior === 0) return 0;

  if (diasDisponiveis < janela) {
    const mediaAtual = atual / Math.max(diasDisponiveis, 1);
    const mediaAnterior = anterior / Math.max(diasDisponiveis, 1);
    return ((mediaAtual - mediaAnterior) / mediaAnterior) * 100;
  } else {
    return ((atual - anterior) / anterior) * 100;
  }
}

/* ===== Tipagem Alertas de Conversa ===== */
type ConversationAlert = {
  id: number;
  type: "Pico de mensagens" | "Queda de resposta" | "Outros";
  team: string;
  startDate: string;
  endDate: string;
  severity: "crítica" | "moderada" | "baixa";
  description: string;
};

const Dashboard = () => {
  /* Cabeçalho */
  const [title, setTitle] = useState("Olá, Atendente 👋");
  const [description, setDescription] = useState(
    "Aqui está uma visão geral do seu atendimento no AtendiGram"
  );
  const [currentMonth, setCurrentMonth] = useState("Agosto 2023");

  /* ==== Cards ==== */
  const [totalContacts, setTotalContacts] = useState(0);
  const [contactsGrowth, setContactsGrowth] = useState(0);

  const [attendedConversations, setAttendedConversations] = useState(0);
  const [conversationsGrowth, setConversationsGrowth] = useState(0);

  const [totalMessages, setTotalMessages] = useState(0);
  const [messagesGrowth, setMessagesGrowth] = useState(0);

  /* ==== Alertas (mock local por enquanto) ==== */
  const [conversationAlerts, setConversationAlerts] = useState<ConversationAlert[]>([]);
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

  /* ====== Fetch dos dados do Supabase ====== */
  useEffect(() => {
    async function fetchMetrics() {
      try {
        const agora = new Date();
        const inicio30dias = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);
        const inicio60dias = new Date(agora.getTime() - 60 * 24 * 60 * 60 * 1000);

        // Contatos (todos - sem filtro de data pois não há created_at)
        const { count: contatosAtuais } = await supabase
          .from("contatos_luna")
          .select("*", { count: "exact", head: true });

        const { count: contatosAnteriores } = await supabase
          .from("contatos_luna")
          .select("*", { count: "exact", head: true });

        // Mensagens
        const { count: msgsAtuais } = await supabase
          .from("logsluna")
          .select("*", { count: "exact", head: true })
          .gte("created_at", inicio30dias.toISOString());

        const { count: msgsAnteriores } = await supabase
          .from("logsluna")
          .select("*", { count: "exact", head: true })
          .gte("created_at", inicio60dias.toISOString())
          .lt("created_at", inicio30dias.toISOString());

        // Conversas (contando todas as mensagens como conversação)
        const { count: convsAtuais } = await supabase
          .from("logsluna")
          .select("*", { count: "exact", head: true })
          .gte("created_at", inicio30dias.toISOString());

        const { count: convsAnteriores } = await supabase
          .from("logsluna")
          .select("*", { count: "exact", head: true })
          .gte("created_at", inicio60dias.toISOString())
          .lt("created_at", inicio30dias.toISOString());

        // Quantos dias temos no histórico (usando logsluna)
        const { data: primeiroLog } = await supabase
          .from("logsluna")
          .select("created_at")
          .order("created_at", { ascending: true })
          .limit(1);

        const diasDisponiveis = primeiroLog?.length
          ? Math.ceil(
              (Date.now() - new Date(primeiroLog[0].created_at).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : 30;

        // Atualiza os estados
        setTotalContacts(contatosAtuais || 0);
        setContactsGrowth(
          calcularPercentual(contatosAtuais || 0, contatosAnteriores || 0, diasDisponiveis)
        );

        setTotalMessages(msgsAtuais || 0);
        setMessagesGrowth(
          calcularPercentual(msgsAtuais || 0, msgsAnteriores || 0, diasDisponiveis)
        );

        setAttendedConversations(convsAtuais || 0);
        setConversationsGrowth(
          calcularPercentual(convsAtuais || 0, convsAnteriores || 0, diasDisponiveis)
        );
      } catch (err) {
        console.error("Erro ao buscar métricas:", err);
      }
    }

    fetchMetrics();
  }, []);

  /* ==== Funções auxiliares para alertas (mock local ainda) ==== */
  const addConversationAlert = () => {
    if (!newConvAlert.team || !newConvAlert.startDate || !newConvAlert.endDate || !newConvAlert.description) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    const newId = Math.max(0, ...conversationAlerts.map((a) => a.id)) + 1;
    setConversationAlerts([...conversationAlerts, { ...newConvAlert, id: newId }]);
    setShowAddAlertDialog(false);
    toast.success("Novo alerta de conversa adicionado");
  };

  const deleteConversationAlert = (id: number) => {
    setConversationAlerts(conversationAlerts.filter((a) => a.id !== id));
    toast.success("Alerta removido");
  };

  return (
    <div className="p-6 space-y-6 animate-enter">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>

        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 text-sm text-agri-primary font-medium bg-agri-primary/10 rounded-lg">
            <Calendar className="h-4 w-4 inline mr-2" />
            {currentMonth}
          </button>
          <button className="px-4 py-2 text-sm bg-agri-primary text-white rounded-lg hover:bg-agri-primary-dark">
            <Wallet className="h-4 w-4 inline mr-2" />
            Nova Conversa
          </button>
        </div>
      </header>

      {/* ===== CARDS RÁPIDOS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total de Contatos */}
        <div className="stat-card card-hover">
          <p className="stat-label">Total de Contatos 👥 (últimos 30 dias)</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value">{totalContacts}</p>
            <span className="text-agri-success text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" /> {contactsGrowth.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Conversas Atendidas */}
        <div className="stat-card card-hover">
          <p className="stat-label">Conversas Atendidas 💬 (últimos 30 dias)</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value">{attendedConversations}</p>
            <span className="text-agri-success text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" /> {conversationsGrowth.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Total de Mensagens */}
        <div className="stat-card card-hover">
          <p className="stat-label">Total de Mensagens ✉️ (últimos 30 dias)</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value">{totalMessages}</p>
            <span className="text-agri-warning text-sm font-medium flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" /> {messagesGrowth.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
