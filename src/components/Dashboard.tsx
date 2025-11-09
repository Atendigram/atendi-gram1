import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";
export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    totalContacts: 0,
    contactsToday: 0,
    messagesMonth: 0
  });

  // 🔄 Função para buscar métricas
  const fetchMetrics = async () => {
    const {
      data,
      error
    } = await supabase.rpc("get_dashboard_metrics");
    if (error) {
      console.error("Error fetching metrics:", error);
    } else if (data && data.length > 0) {
      setMetrics({
        totalContacts: data[0].total_contacts,
        contactsToday: data[0].contacts_today,
        messagesMonth: data[0].messages_month
      });
    }
  };
  useEffect(() => {
    // 🚀 primeira carga
    fetchMetrics();

    // 👀 realtime: contatos
    const contactsChannel = supabase.channel("contatos-realtime").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "contatos_geral"
    }, () => {
      fetchMetrics();
    }).subscribe();

    // 👀 realtime: disparos
    const disparosChannel = supabase.channel("disparos-realtime").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "disparo_items"
    }, () => {
      fetchMetrics();
    }).subscribe();
    return () => {
      supabase.removeChannel(contactsChannel);
      supabase.removeChannel(disparosChannel);
    };
  }, []);
  return <div className="grid grid-cols-3 gap-4">
      {/* 👥 Total Contacts */}
      <Card>
        <CardContent>
          <h2 className="text-lg font-bold">👥 Contatos</h2>
          <p className="text-2xl">{metrics.totalContacts}</p>
        </CardContent>
      </Card>

      {/* 🆕 Contacts Today */}
      <Card>
        <CardContent className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">🆕 Novos Contatos</h2>
            <p className="text-2xl">{metrics.contactsToday}</p>
          </div>
          <ArrowUpRight className="text-green-500 w-6 h-6" />
        </CardContent>
      </Card>

      {/* ✉️ Messages This Month */}
      <Card>
        <CardContent>
          <h2 className="text-lg font-bold">✉️ Mensagens Disparadas</h2>
          <p className="text-2xl">{metrics.messagesMonth}</p>
        </CardContent>
      </Card>
    </div>;
}