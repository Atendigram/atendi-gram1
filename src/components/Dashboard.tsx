import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowUpRight, Calendar, Users, UserPlus, Send } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from "@/contexts/AuthContext";
import { SkeletonCard, SkeletonChart } from "@/components/ui/skeleton-card";

interface MessagesByDay {
  day: string;
  messages_received: number;
}

interface DashboardProps {
  month: string;
}

export default function Dashboard({ month }: DashboardProps) {
  const { profile } = useAuth();
  const [totalContacts, setTotalContacts] = useState(0);
  const [newContacts, setNewContacts] = useState(0);
  const [messagesByDay, setMessagesByDay] = useState<MessagesByDay[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (!profile?.account_id) {
      console.log('Dashboard: Sem account_id no profile');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    console.log('Dashboard: Iniciando fetch com account_id:', profile.account_id);
    try {
      const accountId = profile.account_id;
      const monthDate = new Date(month);
      const year = monthDate.getFullYear();
      const monthNum = monthDate.getMonth() + 1;
      
      // Query 1: Mensagens recebidas por dia do mês usando generate_series
      const startDate = `${year}-${String(monthNum).padStart(2, '0')}-01`;
      const endDate = new Date(year, monthNum, 0);
      const endDateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

      const { data: logsData } = await supabase
        .from('logsgeral')
        .select('data_hora')
        .eq('account_id', accountId)
        .gte('data_hora', startDate)
        .lte('data_hora', `${endDateStr} 23:59:59`);

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
          day: day.split('-')[2],
          messages_received 
        }));

      setMessagesByDay(chartData);

      // Query 2: Total de contatos (contatos_luna)
      const { count, error: contactsError } = await supabase
        .from('contatos_luna')
        .select('user_id', { count: 'exact' })
        .eq('account_id', accountId);
      
      if (contactsError) {
        console.error('Dashboard: Erro ao buscar contatos:', contactsError);
      }
      
      setTotalContacts(count || 0);

      // Query 3: Novos contatos no mês usando created_at
      const { count: newCount, error: newContactsError } = await supabase
        .from('contatos_luna')
        .select('user_id', { count: 'exact' })
        .eq('account_id', accountId)
        .gte('created_at', startDate)
        .lte('created_at', `${endDateStr} 23:59:59`);
      
      if (newContactsError) {
        console.error('Dashboard: Erro ao buscar novos contatos:', newContactsError);
      }
      
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
      const year = monthDate.getFullYear();
      const monthNum = monthDate.getMonth() + 1;
      const startDate = `${year}-${String(monthNum).padStart(2, '0')}-01`;
      const endDate = new Date(year, monthNum, 0);
      const endDateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
      
      const { count, error: sentError } = await supabase
        .from('disparo_items')
        .select('id', { count: 'exact' })
        .eq('account_id', profile.account_id)
        .gte('created_at', startDate)
        .lte('created_at', `${endDateStr} 23:59:59`);
      
      if (sentError) {
        console.error('Dashboard: Erro ao buscar mensagens disparadas:', sentError);
      }
      
      setSentMessages(count || 0);
    };
    
    fetchSentMessages();
  }, [month, profile?.account_id]);

  return (
    <div className="space-y-6">
      {/* Cards de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <Card className="animate-fade-in">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium text-muted-foreground">Total de Contatos</p>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalContacts.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Todos os contatos cadastrados
                </p>
              </CardContent>
            </Card>

            <Card className="animate-fade-in" style={{ animationDelay: '100ms' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium text-muted-foreground">Novos Contatos</p>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{newContacts.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Contatos adicionados este mês
                </p>
              </CardContent>
            </Card>

            <Card className="animate-fade-in" style={{ animationDelay: '200ms' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium text-muted-foreground">Mensagens Disparadas</p>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sentMessages.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Mensagens enviadas este mês
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Gráfico de mensagens por dia */}
      {loading ? (
        <SkeletonChart />
      ) : (
        <Card className="animate-fade-in" style={{ animationDelay: '300ms' }}>
          <CardHeader>
            <CardTitle>Mensagens Recebidas</CardTitle>
            <p className="text-sm text-muted-foreground">
              Volume de mensagens recebidas por dia do mês
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={messagesByDay}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="day" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                  label={{ value: 'Dia do Mês', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                  label={{ value: 'Mensagens', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: number) => [`${value} mensagens`, 'Recebidas']}
                />
                <Bar 
                  dataKey="messages_received" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
