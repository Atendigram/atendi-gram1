// src/components/Dashboard.tsx
import React, { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { EditableField } from "./ui/editable-field";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";

/* helpers */
const onSaveString =
  (setter: React.Dispatch<React.SetStateAction<string>>) => (v: string) =>
    setter(v);

const Dashboard = () => {
  // Cabeçalho
  const [title, setTitle] = useState("Olá, Atendente 👋");
  const [description, setDescription] = useState(
    "Aqui está uma visão geral do seu atendimento no AtendiGram"
  );
  const [currentMonth, setCurrentMonth] = useState("Agosto 2023");

  // Cards
  const [contactsTotal, setContactsTotal] = useState<number>(0);
  const [attendedConversations, setAttendedConversations] = useState<number>(0);

  // Carregar dados do Supabase
  useEffect(() => {
    const load = async () => {
      try {
        // Total de contatos
        const { count: totalContacts, error: e1 } = await supabase
          .from("contatos_luna")
          .select("*", { count: "exact", head: true });
        if (e1) console.error("Erro contatos:", e1);
        setContactsTotal(totalContacts ?? 0);

        // Conversas atendidas
        const { count: totalLogs, error: e2 } = await supabase
          .from("logs_luna")
          .select("*", { count: "exact", head: true });
        if (e2) console.error("Erro logs:", e2);
        setAttendedConversations(totalLogs ?? 0);
      } catch (err) {
        console.error(err);
        toast.error("Falha ao carregar dados do Supabase");
      }
    };
    load();
  }, []);

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
        </div>
      </header>

      {/* Só os 2 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total de Contatos */}
        <div className="stat-card card-hover">
          <p className="stat-label">Total de Contatos 👥</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value">{contactsTotal}</p>
          </div>
        </div>

        {/* Conversas Atendidas */}
        <div className="stat-card card-hover">
          <p className="stat-label">Conversas Atendidas 💬🟢</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value">{attendedConversations}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
