import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, Calendar, Wallet } from 'lucide-react';
import { EditableField } from './ui/editable-field';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';

const Dashboard = () => {
  /* Cabeçalho */
  const [title, setTitle] = useState('Olá, Atendente 👋');
  const [description, setDescription] = useState(
    'Aqui está uma visão geral do seu atendimento no AtendiGram'
  );
  const [currentMonth, setCurrentMonth] = useState('Agosto 2023');

  /* ====== CARDS ====== */
  const [totalContacts, setTotalContacts] = useState(0);
  const [attendedConversations, setAttendedConversations] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);

  /* ===== Buscar dados do Supabase ===== */
  useEffect(() => {
    const fetchData = async () => {
      // Total de contatos
      const { count: contactsCount, error: contactsError } = await supabase
        .from('contatos_luna')
        .select('*', { count: 'exact', head: true });
      if (contactsError) {
        console.error('Erro ao buscar contatos:', contactsError.message);
      } else {
        setTotalContacts(contactsCount || 0);
      }

      // Conversas atendidas (últimos 30 dias)
      const { count: conversationsCount, error: convError } = await supabase
        .from('logsluna')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      if (convError) {
        console.error('Erro ao buscar conversas:', convError.message);
      } else {
        setAttendedConversations(conversationsCount || 0);
      }

      // Total de mensagens (últimos 30 dias)
      const { count: messagesCount, error: msgError } = await supabase
        .from('logsluna')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      if (msgError) {
        console.error('Erro ao buscar mensagens:', msgError.message);
      } else {
        setTotalMessages(messagesCount || 0);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-6 animate-enter">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">
            <EditableField value={title} onSave={(v) => setTitle(String(v))} className="inline-block" showEditIcon />
          </h1>
          <p className="text-muted-foreground">
            <EditableField value={description} onSave={(v) => setDescription(String(v))} className="inline-block" showEditIcon />
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 text-sm text-agri-primary font-medium bg-agri-primary/10 rounded-lg hover:bg-agri-primary/20 transition-colors">
            <Calendar className="h-4 w-4 inline mr-2" />
            <EditableField value={currentMonth} onSave={(v) => setCurrentMonth(String(v))} className="inline-block" />
          </button>
          <button
            className="px-4 py-2 text-sm bg-agri-primary text-white rounded-lg hover:bg-agri-primary-dark transition-colors"
            onClick={() => toast.info('Nova conversa em breve...')}
          >
            <Wallet className="h-4 w-4 inline mr-2" />
            Nova Conversa
          </button>
        </div>
      </header>

      {/* ====== CARDS RÁPIDOS ====== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total de Contatos 👥 */}
        <div className="stat-card card-hover">
          <p className="stat-label">Total de Contatos 👥</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value">{totalContacts}</p>
            <span className="text-agri-success text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" /> +8.5%
            </span>
          </div>
        </div>

        {/* Conversas Atendidas 💬 (últimos 30 dias) */}
        <div className="stat-card card-hover">
          <p className="stat-label">Conversas Atendidas 💬 (últimos 30 dias)</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value">{attendedConversations}</p>
            <span className="text-agri-success text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" /> +5.2%
            </span>
          </div>
        </div>

        {/* Total de Mensagens ✉️ (últimos 30 dias) */}
        <div className="stat-card card-hover">
          <p className="stat-label">Total de Mensagens ✉️ (últimos 30 dias)</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value">{totalMessages}</p>
            <span className="text-agri-warning text-sm font-medium flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" /> Recentes
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
