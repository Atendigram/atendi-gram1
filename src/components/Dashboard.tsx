// src/components/Dashboard.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Calendar } from "lucide-react";
import { EditableField } from "./ui/editable-field";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";

/* ------------------------------ helpers ------------------------------ */
function startOfDaysAgo(days: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

const onSaveString =
  (setter: React.Dispatch<React.SetStateAction<string>>) => (v: string) =>
    setter(v);
const onSaveNumber =
  (setter: React.Dispatch<React.SetStateAction<number>>) => (v: string) =>
    setter(Number(v));

const Dashboard = () => {
  // Cabeçalho
  const [title, setTitle] = useState("Olá, Atendente 👋");
  const [description, setDescription] = useState(
    "Aqui está uma visão geral do seu atendimento no AtendiGram"
  );
  const [currentMonth, setCurrentMonth] = useState("Agosto 2023");

  // Cards
  const [contacts30, setContacts30] = useState<number>(0);
  const [messages30, setMessages30] = useState<number>(0);
  const [attendedConversations, setAttendedConversations] = useState<number>(75);
  const [activeContacts, setActiveContacts] = useState<number>(0);
  const [newActive, setNewActive] = useState<number>(5);

  const since30 = useMemo(() => startOfDaysAgo(30), []);

  // Carregar dados do Supabase
  useEffect(() => {
    const load = async () => {
      try {
        const { count: contactsNow, error: e1 } = await supabase
          .from("contatos_luna")
          .select("*", { count: "exact", head: true })
          .gte("created_at", since30);
        if (e1) console.error("contatos (30d):", e1);
        setContacts30(contactsNow ?? 0);

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
          {/* Botão "Nova Conversa" removido a pedido */}
        </div>
      </header>

      {/* Só os cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total de Contatos (30d) */}
        <div className="stat-card card-hover">
          <p className="stat-label">
            Total de Contatos 👥{" "}
            <span className="text-muted-foreground">(últimos 30 dias)</span>
          </p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value">{contacts30}</p>
          </div>
        </div>

        {/* Contatos Ativos */}
        <div className="stat-card card-hover">
          <p className="stat-label">Contatos Ativos 🟢</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value">
              <EditableField
                value={activeContacts}
                type="number"
                onSave={onSaveNumber(setActiveContacts)}
                className="inline-block font-bold"
              />
            </p>
            <span className="text-sm font-medium text-muted-foreground">
              <EditableField
                value={newActive}
                type="number"
                onSave={onSaveNumber(setNewActive)}
                className="inline-block"
              />{" "}
              novos
            </span>
          </div>
        </div>

        {/* Conversas Atendidas */}
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
          </div>
        </div>

        {/* Total de Mensagens */}
        <div className="stat-card card-hover">
          <p className="stat-label">
            Total de Mensagens ✉️{" "}
            <span className="text-muted-foreground">(últimos 30 dias)</span>
          </p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value">{messages30}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
