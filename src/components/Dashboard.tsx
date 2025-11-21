import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowUpRight, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from "@/contexts/AuthContext";

interface MessagesByDay {
  day: string;
  messages_received: number;
}

export default function Dashboard() {
  const { profile } = useAuth();
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  });
  const [totalContacts, setTotalContacts] = useState(0);
  const [newContacts, setNewContacts] = useState(0);
  const [messagesByDay, setMessagesByDay] = useState<MessagesByDay[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (!profile?.account_id) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const accountId = profile.account_id;
      
      // Query 1: Mensagens recebidas por dia do mês (logsgeral)
      const monthDate = new Date(month);
      const startDate = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}-01`;
      const endDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

      const { data: logsData } = await supabase
        .from('logsgeral')
        .select('data_hora')
        .eq('account_id', accountId)
        .gte('data_hora', startDate)
        .lte('data_hora', endDateStr);

      // Processar dados por dia
      const dayMap = new Map<string, number>();
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        dayMap.set(dayStr, 0);
      }

      logsData?.forEach((log) => {
        const logDate = new Date(log.data_hora);
        const dayStr = `${logDate.getFullYear()}-${String(logDate.getMonth() + 1).padStart(2, '0')}-${String(logDate.getDate()).padStart(2, '0')}`;
        dayMap.set(dayStr, (dayMap.get(dayStr) || 0) + 1);
      });

      const chartData = Array.from(dayMap.entries())
        .map(([day, messages_received]) => ({ 
          day: day.split('-')[2], // Apenas o dia
          messages_received 
        }));

      setMessagesByDay(chartData);

      // Query 2: Total de contatos (contatos_luna)
      const { count } = await supabase
        .from('contatos_luna')
        .select('user_id', { count: 'exact' })
        .eq('account_id', accountId);
      
      setTotalContacts(count || 0);

      // Query 3: Novos contatos no mês (contatos_luna)
      const { count: newCount } = await supabase
        .from('contatos_luna')
        .select('user_id', { count: 'exact' })
        .eq('account_id', accountId)
        .gte('created_at', startDate)
        .lte('created_at', endDateStr);
      
      setNewContacts(newCount || 0);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.account_id) {
      fetchDashboardData();
    }
  }, [month, profile?.account_id]);

  // Query para mensagens disparadas no período (disparo_items)
  const [sentMessages, setSentMessages] = useState(0);
  
  useEffect(() => {
    const fetchSentMessages = async () => {
      if (!profile?.account_id) return;
      
      const monthDate = new Date(month);
      const startDate = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}-01`;
      const endDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
      
      const { count } = await supabase
        .from('disparo_items')
        .select('id', { count: 'exact' })
        .eq('account_id', profile.account_id)
        .eq('status', 'sent')
        .gte('sent_at', startDate)
        .lte('sent_at', endDateStr);
      
      setSentMessages(count || 0);
    };
    
    fetchSentMessages();
  }, [month, profile?.account_id]);

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="max-w-xs">
            <Label htmlFor="month" className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4" />
              Mês
            </Label>
            <Input
              id="month"
              type="month"
              value={month.substring(0, 7)}
              onChange={(e) => setMonth(`${e.target.value}-01`)}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">👥 Contatos</p>
                <p className="text-2xl font-bold">{loading ? "..." : totalContacts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">🆕 Novos Contatos</p>
                <p className="text-2xl font-bold">{loading ? "..." : newContacts}</p>
              </div>
              <ArrowUpRight className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">📤 Mensagens Disparadas</p>
              <p className="text-2xl font-bold">{loading ? "..." : sentMessages}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de mensagens por dia */}
      <Card>
        <CardHeader>
          <CardTitle>Mensagens Recebidas - Últimos 30 Dias</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Carregando...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={messagesByDay}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="day" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar 
                  dataKey="messages_received" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
