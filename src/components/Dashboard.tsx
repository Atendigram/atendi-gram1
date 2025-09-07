// src/components/Dashboard.tsx
import React, { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { EditableField } from "./ui/editable-field";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import { useAuth } from '@/contexts/AuthContext';
import { scopedCount } from '@/lib/scoped-queries';

/* ---------------- CONFIG ---------------- */
const CONTACTS_TABLE = "contatos_luna";
const LOGS_TABLE = "logsluna";

/* ---------------- HELPERS ---------------- */
const onSaveString =
  (setter: React.Dispatch<React.SetStateAction<string>>) => (v: string) =>
    setter(v);

const nf = new Intl.NumberFormat("pt-BR");

async function countTable(table: string, accountId: string) {
  const r1 = await scopedCount(table, accountId);
  if (!r1.error && typeof r1.count === "number") return r1.count ?? 0;

  const r2 = await (supabase as any).from(table).select("id", { count: "exact" }).eq('account_id', accountId).range(0, 0);
  if (!r2.error && typeof r2.count === "number") return r2.count ?? 0;

  throw r1.error || r2.error || new Error(`Falha ao contar ${table}`);
}

/* ---------------- COMPONENT ---------------- */
const Dashboard = () => {
  const { profile } = useAuth();
  const accountId = profile?.account_id;
  const [title, setTitle] = useState("Olá 👋");
  const [description, setDescription] = useState(
    "Aqui está uma visão geral do seu atendimento no AtendiGram"
  );
  const [currentMonth, setCurrentMonth] = useState("Agosto 2023");

  const [contactsTotal, setContactsTotal] = useState<number>(0);
  const [attendedConversations, setAttendedConversations] = useState<number>(0);

  // Load inicial
  useEffect(() => {
    if (!accountId) return;
    
    (async () => {
      try {
        const [totalContacts, totalLogs] = await Promise.all([
          countTable(CONTACTS_TABLE, accountId),
          countTable(LOGS_TABLE, accountId),
        ]);
        setContactsTotal(totalContacts);
        setAttendedConversations(totalLogs);
      } catch (err: any) {
        console.error(err);
        toast.error(`Erro ao carregar: ${err?.message || "ver console"}`);
      }
    })();
  }, [accountId]);

  // Realtime (sem F5)
  useEffect(() => {
    if (!accountId) return;
    
    const chContacts = supabase
      .channel(`rt:${CONTACTS_TABLE}:${accountId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: CONTACTS_TABLE, filter: `account_id=eq.${accountId}` },
        () => setContactsTotal((n) => n + 1)
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: CONTACTS_TABLE, filter: `account_id=eq.${accountId}` },
        () => setContactsTotal((n) => Math.max(0, n - 1))
      )
      .subscribe();

    const chLogs = supabase
      .channel(`rt:${LOGS_TABLE}:${accountId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: LOGS_TABLE, filter: `account_id=eq.${accountId}` },
        () => setAttendedConversations((n) => n + 1)
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: LOGS_TABLE, filter: `account_id=eq.${accountId}` },
        () => setAttendedConversations((n) => Math.max(0, n - 1))
      )
      .subscribe();

    return () => {
      supabase.removeChannel(chContacts);
      supabase.removeChannel(chLogs);
    };
  }, [accountId]);

  if (!accountId) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center space-y-3">
          <div className="animate-pulse">
            <div className="w-8 h-8 bg-primary/20 rounded-full mx-auto mb-3"></div>
            <p className="text-muted-foreground">Carregando informações da conta...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 max-w-md mx-auto">
            <div className="bg-card p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground">Total de Contatos 👥</p>
              <p className="text-2xl font-bold">--</p>
            </div>
            <div className="bg-card p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground">Conversas Atendidas 💬</p>
              <p className="text-2xl font-bold">--</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <p className="stat-value">{nf.format(contactsTotal)}</p>
          </div>
        </div>

        {/* Conversas Atendidas */}
        <div className="stat-card card-hover">
          <p className="stat-label">Conversas Atendidas 💬</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value">{nf.format(attendedConversations)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
