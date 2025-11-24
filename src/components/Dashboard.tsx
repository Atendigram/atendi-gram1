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
      // Parse month properly - month format is 'YYYY-MM-DD'
      const [yearStr, monthStr] = month.split('-');
      const year = parseInt(yearStr);
      const monthNum = parseInt(monthStr);
      
      console.log('Dashboard: Buscando dados para ano:', year, 'mês:', monthNum);
      
      // Query 1: Mensagens recebidas por dia do mês
      const startDate = `${year}-${String(monthNum).padStart(2, '0')}-01`;
      const nextMonth = monthNum === 12 ? 1 : monthNum + 1;
      const nextYear = monthNum === 12 ? year + 1 : year;
      const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

      const { data: logsData, error: logsError } = await supabase
        .from('logsgeral')
        .select('data_hora')
        .eq('account_id', accountId)
        .gte('data_hora', startDate)
        .lt('data_hora', endDate);

      if (logsError) {
        console.error('Dashboard: Erro ao buscar logs:', logsError);
        setMessagesByDay([]);
      } else {
        console.log('Dashboard: Registros de logs recebidos:', logsData?.length || 0);
        
        // Log algumas datas de exemplo
        if (logsData && logsData.length > 0) {
          console.log('Dashboard: Exemplo de data:', logsData[0].data_hora);
          console.log('Dashboard: Exemplo parseado:', new Date(logsData[0].data_hora));
        }
        
        // Processar dados por dia - criar todos os dias do mês
        const daysInMonth = new Date(year, monthNum, 0).getDate();
        console.log('Dashboard: Dias no mês:', daysInMonth);
        console.log('Dashboard: Filtrando para ano:', year, 'mês:', monthNum);
        
        const dayMap = new Map<number, number>();
        
        // Inicializar todos os dias com 0
        for (let d = 1; d <= daysInMonth; d++) {
          dayMap.set(d, 0);
        }

        // Contar mensagens por dia - usar UTC para evitar problemas de timezone
        let matchCount = 0;
        logsData?.forEach((log, index) => {
          const logDate = new Date(log.data_hora);
          const day = logDate.getUTCDate();
          const logMonth = logDate.getUTCMonth() + 1;
          const logYear = logDate.getUTCFullYear();
          
          // Log primeiros 3 registros para debug
          if (index < 3) {
            console.log(`Dashboard: Log ${index}:`, {
              data_hora: log.data_hora,
              parsed: logDate.toISOString(),
              day,
              month: logMonth,
              year: logYear,
              match: logYear === year && logMonth === monthNum
            });
          }
          
          // Só contar se for do mês/ano correto
          if (logYear === year && logMonth === monthNum) {
            matchCount++;
            dayMap.set(day, (dayMap.get(day) || 0) + 1);
          }
        });
        
        console.log('Dashboard: Total de logs que matched:', matchCount);

        // Converter para array ordenado
        const chartData = Array.from(dayMap.entries())
          .sort((a, b) => a[0] - b[0])
          .map(([day, messages_received]) => ({ 
            day: String(day).padStart(2, '0'),
            messages_received 
          }));

        console.log('Dashboard: Gráfico de mensagens processado:', chartData.length, 'dias');
        console.log('Dashboard: Primeiros 5 dias do gráfico:', chartData.slice(0, 5));
        console.log('Dashboard: Últimos 5 dias do gráfico:', chartData.slice(-5));
        setMessagesByDay(chartData);
      }

      // Query 2: Total de contatos (contatos_luna)
      const { count, error: contactsError } = await supabase
        .from('contatos_luna')
        .select('user_id', { count: 'exact' })
        .eq('account_id', accountId);
      
      if (contactsError) {
        console.error('Dashboard: Erro ao buscar contatos:', contactsError);
      }
      
      setTotalContacts(count || 0);

      // Query 3: Novos contatos no mês usando SQL EXTRACT
      const { count: newContactsCount, error: newContactsError } = await supabase
        .from('contatos_luna')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', accountId)
        .filter('created_at', 'not.is', null)
        .gte('created_at', `${year}-${String(monthNum).padStart(2, '0')}-01`)
        .lt('created_at', `${year}-${String(monthNum + 1).padStart(2, '0')}-01`);
      
      if (newContactsError) {
        console.error('Dashboard: Erro ao buscar novos contatos:', newContactsError);
        setNewContacts(0);
      } else {
        console.log('Dashboard: Novos contatos encontrados:', newContactsCount);
        setNewContacts(newContactsCount || 0);
      }
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
      
      const [yearStr, monthStr] = month.split('-');
      const year = parseInt(yearStr);
      const monthNum = parseInt(monthStr);
      
      // Buscar mensagens disparadas usando range de datas
      const { count: sentCount, error: sentError } = await supabase
        .from('disparo_items')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', profile.account_id)
        .filter('created_at', 'not.is', null)
        .gte('created_at', `${year}-${String(monthNum).padStart(2, '0')}-01`)
        .lt('created_at', `${year}-${String(monthNum + 1).padStart(2, '0')}-01`);
      
      if (sentError) {
        console.error('Dashboard: Erro ao buscar mensagens disparadas:', sentError);
        setSentMessages(0);
      } else {
        console.log('Dashboard: Mensagens disparadas encontradas:', sentCount);
        setSentMessages(sentCount || 0);
      }
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
