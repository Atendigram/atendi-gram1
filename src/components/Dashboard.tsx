// src/components/Dashboard.tsx (trecho principal focado nos cards + loading)

// ⬇️ ajuste o caminho se necessário:
import { supabase } from "../lib/supabase";

import React, { useEffect, useMemo, useState } from 'react';
import { TrendingUp, AlertTriangle, Users } from 'lucide-react';

// ———————————————————————— helpers ————————————————————————
function startOfDaysAgo(days: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function formatDelta(current: number, previous: number) {
  if (!previous) return '0.0%';
  const delta = ((current - previous) / previous) * 100;
  const sign = delta > 0 ? '+' : '';
  return `${sign}${delta.toFixed(1)}%`;
}

// ———————————————————————— componente ————————————————————————
export default function Dashboard() {
  // últimos 30 dias
  const since30 = useMemo(() => startOfDaysAgo(30), []);
  // período anterior (31–60 dias atrás)
  const prevSince30 = useMemo(() => startOfDaysAgo(60), []);
  const prevUntil30 = useMemo(() => startOfDaysAgo(30), []);

  const [contacts30, setContacts30] = useState<number>(0);
  const [contactsPrev, setContactsPrev] = useState<number>(0);

  const [msgs30, setMsgs30] = useState<number>(0);
  const [msgsPrev, setMsgsPrev] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchCounts() {
      setLoading(true);
      setErrorMsg(null);

      // ---------- contatos (30d) ----------
      const { count: c30, error: e1 } = await supabase
        .from('contatos_luna')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', since30);

      // ---------- contatos (período anterior) ----------
      const { count: cPrev, error: e2 } = await supabase
        .from('contatos_luna')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', prevSince30)
        .lt('created_at', prevUntil30);

      // ---------- mensagens (30d) ----------
      const { count: m30, error: e3 } = await supabase
        .from('logsluna')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', since30);

      // ---------- mensagens (período anterior) ----------
      const { count: mPrev, error: e4 } = await supabase
        .from('logsluna')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', prevSince30)
        .lt('created_at', prevUntil30);

      if (cancelled) return;

      if (e1 || e2 || e3 || e4) {
        setErrorMsg(
          e1?.message || e2?.message || e3?.message || e4?.message || 'Erro ao carregar dados.'
        );
      }

      setContacts30(c30 ?? 0);
      setContactsPrev(cPrev ?? 0);
      setMsgs30(m30 ?? 0);
      setMsgsPrev(mPrev ?? 0);
      setLoading(false);
    }

    fetchCounts();
    return () => {
      cancelled = true;
    };
  }, [since30, prevSince30, prevUntil30]);

  const contactsDelta = formatDelta(contacts30, contactsPrev);
  const msgsDelta = formatDelta(msgs30, msgsPrev);

  return (
    <div className="p-6 space-y-6">
      {/* … seu header aqui … */}

      {errorMsg && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {/* ====== CARDS (últimos 30 dias) ====== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Total de Contatos (30d) */}
        <div className="stat-card card-hover">
          <p className="stat-label flex items-center gap-2">
            <Users className="h-4 w-4" />
            Total de Contatos <span className="text-muted-foreground">(últimos 30 dias)</span>
          </p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value">{loading ? '—' : contacts30}</p>
            <span className="text-agri-success text-sm font-medium flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              {loading ? '0.0%' : contactsDelta}
            </span>
          </div>
        </div>

        {/* Conversas Atendidas (30d) — se você quiser, pode trocar a origem depois */}
        <div className="stat-card card-hover">
          <p className="stat-label">
            Conversas Atendidas <span className="text-muted-foreground">(últimos 30 dias)</span>
          </p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value">{loading ? '—' : msgs30}</p>
            <span className="text-agri-success text-sm font-medium flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              {loading ? '0.0%' : msgsDelta}
            </span>
          </div>
        </div>

        {/* Total de Mensagens (30d) */}
        <div className="stat-card card-hover">
          <p className="stat-label">
            Total de Mensagens <span className="text-muted-foreground">(últimos 30 dias)</span>
          </p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value">{loading ? '—' : msgs30}</p>
            <span className="text-agri-warning text-sm font-medium flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              {loading ? '0.0%' : msgsDelta}
            </span>
          </div>
        </div>
      </div>

      {/* … resto do seu dashboard (tabela de alertas, gráficos, etc.) … */}
    </div>
  );
}
