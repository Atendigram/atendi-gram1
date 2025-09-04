// src/components/Dashboard.tsx
import React, { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { EditableField } from "./ui/editable-field";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";

/* ---------------- CONFIGURAÇÃO ---------------- */
const CONTACTS_TABLE = "contatos_luna"; // tabela de contatos
const LOGS_TABLE = "logsluna";          // tabela de logs (como está no Supabase)

/* ---------------- HELPERS ---------------- */
const onSaveString =
  (setter: React.Dispatch<React.SetStateAction<string>>) => (v: string) =>
    setter(v);

// util para contar linhas de uma tabela com fallback
async function countTable(table: string) {
  // tentativa 1
  let r1 = await supabase.from(table).select("*", { count: "exact", head: true });
  if (!r1.error && typeof r1.count === "number") return r1.count ?? 0;

  // tentativa 2
  let r2 = await supabase.from(table).select("id", { count: "exact" }).range(0, 0);
  if (!r2.error && typeof r2.count === "number") return r2.count ?? 0;

  // se falhar
  throw r1.error || r2.error || new Error(`Falha ao contar ${table}`);
}

/* ---------------- COMPONENTE ---------------- */
const Dashboard = () => {
  const [title, setTitle] = useState("Olá 👋");
  const [description, setDescription] = useState(
    "Aqui está uma visão geral do seu atendimento no AtendiGram"
  );
  const [currentMonth, setCurrentMonth] = useState("Agosto 2023");

  const [contactsTotal, setContactsTotal] = useState<number>(0);
  const [attendedConversations, setAttendedConversations] = useState<number>(0);

  useEffect(() => {
    (async () => {
      try {
        const [totalContacts, totalLogs] = await Promise.all([
          countTable(CONTACTS_TABLE),
          countTable(LOGS_TABLE),
        ]);
        setContactsTotal(totalContacts);
        setAttendedConversations(totalLogs);
      } catch (err: any) {
        console.error(err);
        toast.error(`Erro ao carregar: ${err?.message || "ver console"}`);
      }
    })();
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
          <button className="px-4 py-2 text-sm text-pink-600 font-medium bg-pink-100 rounded-lg hover:bg-pink-200 transition-colors">
            <Calendar className="h-4 w-4 inline mr-2" />
            <EditableField
              value={currentMonth}
              onSave={onSaveString(setCurrentMonth)}
              className="inline-block"
            />
          </button>
        </div>
      </header>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total de Contatos */}
        <div className="stat-card card-hover">
          <p className="stat-label">Total de Contatos 👥</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value">{contactsTotal}</p>
          </div>
        </div>

        {/* Conversas Atendidas🟢 */}
        <div className="stat-card card-hover">
          <p className="stat-label">Conversas Atendidas 💬</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value">{attendedConversations}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
