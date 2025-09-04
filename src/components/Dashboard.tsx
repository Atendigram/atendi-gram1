// src/components/Dashboard.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Calendar, Wallet } from "lucide-react";
import { EditableField } from "./ui/editable-field";
import { Button } from "./ui/button";
import { toast } from "sonner";

// 👉 ajuste o caminho se necessário
import { supabase } from "../lib/supabase";

/* ------------------------------ helpers ------------------------------ */
function startOfDaysAgo(days: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

// wrappers compatíveis com EditableField
const onSaveString =
  (setter: React.Dispatch<React.SetStateAction<string>>) => (v: string) =>
    setter(v);
const onSaveNumber =
  (setter: React.Dispatch<React.SetStateAction<number>>) => (v: string) =>
    setter(Number(v));
const noop = (_: string) => {};

const Dashboard = () => {
  /* Cabeçalho */
  const [title, setTitle] = useState("Olá, Atendente 👋");
  const [description, setDescription] = useState(
    "Aqui está uma visão geral do seu atendimento no AtendiGram"
  );
  const [currentMonth, setCurrentMonth] = useState("Agosto 2023");

  /* ====== CARDS (dados do Supabase) ====== */
  const [contacts30, setContacts30] = useState<number>(0);
  const [messages30, setMessages30] = useState<number>(0);

  // campos manuais (até conectar de fato)
  const [attendedConversations, setAttendedConversations] = useState<number>(75);

  // janela de tempo
  const since30 = useMemo(() => startOfDaysAgo(30), []);

  /* -------------------- Carregar dados do Supabase -------------------- */
  useEffect(() => {
    const load = async () => {
      try {
        // Contatos 30d
        const { count: contactsNow, error: e1 } = await supabase
          .from("contatos_luna")
          .select("*", { count: "exact", head: true })
          .gte("created_at", since30);
        if (e1) console.error("contatos (30d):", e1);
        setContacts30(contactsNow ?? 0);

        // Mensagens 30d
        const { count: msgsNow, error: e3 } = await supabase
          .from("logs_luna")
          .select("*", { count: "exact", head: true })
          .gte("created_at", since30);
        if (e3) console.error("mensagens (30d):", e3);
        setMessages30(msgsNow ?? 0);
      } catch (err) {
        console.error(err);
        toast.error("Falha ao carregar dados do Supabase");
      }
    };

    load();
  }, [since30]);

  const handleAddConversation = () => {
    toast.info("Redirecionando para Finanças…");
  };

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
            onClick={handleAddConversation}
          >
            <Wallet className="h-4 w-4 inline mr-2" />
            Nova Conversa
          </button>
        </div>
      </header>

      {/* ====== SÓ OS CARDS ====== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total de Contatos (30d) 👥 */}
        <div className="stat-card card-hover">
          <p className="stat-label">
            Total de Contatos 👥{" "}
            <span className="text-muted-foreground">(últimos 30 dias)</span>
          </p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value">{contacts30}</p>
            {/* sem % */}
          </div>
        </div>

        {/* Contatos Ativos (manual por enquanto) 🟢 */}
        <div className="stat-card card-hover">
          <p className="stat-label">Contatos Ativos 🟢</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value">
              <EditableField
                value={0}
                type="number"
                onSave={noop}
                className="inline-block font-bold"
              />
            </p>
            <span className="text-sm font-medium text-muted-foreground">
              {/* sem “novos %”, só se quiser manter “novos” */}
              <EditableField
                value={5}
                type="number"
                onSave={noop}
                className="inline-block"
              />{" "}
              novos
            </span>
          </div>
        </div>

        {/* Conversas atendidas 💬 */}
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
            {/* sem % */}
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
            {/* sem % */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
