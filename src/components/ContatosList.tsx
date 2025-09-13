import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Search, ChevronLeft, ChevronRight, Users, Download, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { scopedSelectWithColumns, scopedCount } from '@/lib/scoped-queries';
import { useLocation } from 'react-router-dom'; // 👈 importa localização

interface Contact {
  user_id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  created_at: string;
}

const ITEMS_PER_PAGE = 25;

const ContatosList = () => {
  const { profile } = useAuth();
  const accountId = profile?.account_id;
  const location = useLocation(); // 👈 pega rota atual

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [exporting, setExporting] = useState(false);

  // 🔑 recarrega também quando rota muda
  useEffect(() => {
    if (accountId) {
      loadContacts();
    }
  }, [currentPage, searchTerm, accountId, location.pathname]);

  const loadContacts = async () => {
    if (!accountId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let query = scopedSelectWithColumns('contatos_geral', 'user_id, first_name, last_name, username, created_at', accountId);

      if (searchTerm) {
        const isNumeric = /^\d+$/.test(searchTerm);
        if (isNumeric) {
          query = query.or(`user_id.eq.${searchTerm},first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`);
        } else {
          query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`);
        }
      }

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      setContacts((data as Contact[]) || []);
      setFilteredCount(count || 0);

      if (!searchTerm) {
        setTotalCount(count || 0);
      } else if (currentPage === 1) {
        const { count: total } = await scopedCount('contatos_geral', accountId);
        setTotalCount(total || 0);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os contatos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
      return 'Data inválida';
    }
  };

  const formatName = (contact: Contact) => {
    const firstName = contact.first_name || '';
    const lastName = contact.last_name || '';
    return [firstName, lastName].filter(Boolean).join(' ') || 'Sem nome';
  };

  const totalPages = Math.ceil(filteredCount / ITEMS_PER_PAGE);

  const handlePreviousPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const handleSearch = (value: string) => { setSearchTerm(value); setCurrentPage(1); };

  // botão manual 🔄
  const handleRefresh = () => {
    loadContacts();
    toast({ title: "Atualizado", description: "Lista de contatos recarregada" });
  };

  // ... resto igual (tabela, paginação, export CSV)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Contatos</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* total/filtrados igual ao seu código */}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>❤️👥 Lista de Contatos</CardTitle>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por user_id, nome ou username..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-1" /> Atualizar
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={exportToCSV}
                disabled={exporting || filteredCount === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                {exporting ? 'Exportando...' : 'Exportar CSV'}
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* ... resto igual ao seu render (loading, tabela, paginação) */}
      </Card>
    </div>
  );
};

export default ContatosList;
