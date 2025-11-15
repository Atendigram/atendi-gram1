import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Search, ChevronLeft, ChevronRight, Users, Download, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { scopedSelectWithColumns, scopedCount } from '@/lib/scoped-queries';
import { useLocation } from 'react-router-dom';
import { exportToCSV } from '@/utils/crm-data-operations';

interface Contact {
  user_id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  created_at: string;
}

const ITEMS_PER_PAGE = 25;

const ContatosList = () => {
  const { user } = useAuth();
  const location = useLocation(); // 👈 pega rota atual

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [contactsTable, setContactsTable] = useState<string>('contatos_geral');

  // 🔑 Get contacts table name based on account_id
  const getContactsTableName = (accountId: string): string => {
    // Map specific accounts to their tables
    const accountTableMap: Record<string, string> = {
      '5777f0ad-719d-4d92-b23b-aefa9d7077ac': 'contatos_luna',
      '0727f119-2e77-42f5-ab9c-7a5f3aacedc0': 'contatos_bella',
    };
    
    return accountTableMap[accountId] || 'contatos_geral';
  };

  // 🔑 Resolve account_id from accounts table
  const resolveAccountId = async () => {
    if (!user?.id) {
      console.log('No user available');
      setAccountId(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (error) {
        console.error('Error resolving account_id:', error);
        setAccountId(null);
        return;
      }

      console.log('Resolved account_id:', data.id);
      setAccountId(data.id);
      const tableName = getContactsTableName(data.id);
      setContactsTable(tableName);
      console.log('Using contacts table:', tableName);
    } catch (error) {
      console.error('Error resolving account_id:', error);
      setAccountId(null);
    }
  };

  // 🔄 Resolve account_id when user changes
  useEffect(() => {
    resolveAccountId();
  }, [user?.id]);

  // 🔑 recarrega também quando rota muda ou accountId muda
  useEffect(() => {
    if (accountId) {
      loadContacts();
    }
  }, [currentPage, searchTerm, accountId, location.pathname]);

  const loadContacts = async () => {
    if (!accountId) {
      console.log('No accountId available');
      setLoading(false);
      return;
    }

    console.log('Loading contacts for account:', accountId);
    setLoading(true);
    try {
      // Base query with account_id filter - use dynamic table name
      let query = scopedSelectWithColumns(contactsTable, 'user_id, first_name, last_name, username, created_at', accountId);

      // Apply search filters if search term exists
      if (searchTerm.trim()) {
        const isNumeric = /^\d+$/.test(searchTerm.trim());
        if (isNumeric) {
          // Search by user_id or text fields
          query = query.or(`user_id.eq.${searchTerm.trim()},first_name.ilike.%${searchTerm.trim()}%,last_name.ilike.%${searchTerm.trim()}%,username.ilike.%${searchTerm.trim()}%`);
        } else {
          // Search only text fields
          query = query.or(`first_name.ilike.%${searchTerm.trim()}%,last_name.ilike.%${searchTerm.trim()}%,username.ilike.%${searchTerm.trim()}%`);
        }
      }

      // Apply pagination
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      // Execute query with ordering and pagination
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Query error:', error);
        throw error;
      }

      console.log('Loaded contacts:', data?.length || 0, 'Total count:', count);
      
      setContacts((data as Contact[]) || []);
      setFilteredCount(count || 0);

      // Get total count for the account (without search filter)
      if (!searchTerm.trim()) {
        setTotalCount(count || 0);
      } else {
        // When searching, we need to get the total count separately - use dynamic table name
        const { count: total } = await scopedCount(contactsTable, accountId);
        setTotalCount(total || 0);
      }
    } catch (error: any) {
      console.error('Error loading contacts:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível carregar os contatos",
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
  const handleRefresh = async () => {
    console.log('Manual refresh triggered');
    await loadContacts();
    toast({ 
      title: "Atualizado", 
      description: `Lista de contatos recarregada (${filteredCount} encontrados)` 
    });
  };

  const handleExportCSV = async () => {
    if (!accountId) {
      toast({
        title: "Erro",
        description: "Account ID não encontrado",
        variant: "destructive",
      });
      return;
    }
    
    setExporting(true);
    try {
      console.log('Exporting contacts for account:', accountId);
      
      // Use the same query logic as loadContacts for consistency - use dynamic table name
      let query = scopedSelectWithColumns(contactsTable, 'user_id, first_name, last_name, username, created_at', accountId);
      
      if (searchTerm.trim()) {
        const isNumeric = /^\d+$/.test(searchTerm.trim());
        if (isNumeric) {
          query = query.or(`user_id.eq.${searchTerm.trim()},first_name.ilike.%${searchTerm.trim()}%,last_name.ilike.%${searchTerm.trim()}%,username.ilike.%${searchTerm.trim()}%`);
        } else {
          query = query.or(`first_name.ilike.%${searchTerm.trim()}%,last_name.ilike.%${searchTerm.trim()}%,username.ilike.%${searchTerm.trim()}%`);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('Export query error:', error);
        throw error;
      }

      const exportData = (data as Contact[]).map(contact => ({
        'ID do Usuário': contact.user_id,
        'Nome': formatName(contact),
        'Username': contact.username || 'N/A',
        'Data de Criação': formatDate(contact.created_at)
      }));

      const fileName = `contatos_${searchTerm.trim() ? 'filtrados_' : ''}${new Date().toISOString().split('T')[0]}`;
      exportToCSV(exportData, fileName);
      
      toast({
        title: "Sucesso",
        description: `${exportData.length} contatos exportados para CSV`,
      });
    } catch (error: any) {
      console.error('Error exporting contacts:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível exportar os contatos",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Contatos</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Contatos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCount.toLocaleString()}</div>
            </CardContent>
          </Card>

          {searchTerm && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Contatos Filtrados</CardTitle>
                <Search className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredCount.toLocaleString()}</div>
              </CardContent>
            </Card>
          )}
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
                onClick={handleExportCSV}
                disabled={exporting || filteredCount === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                {exporting ? 'Exportando...' : 'Exportar CSV'}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'Nenhum contato encontrado para a busca.' : 'Nenhum contato disponível.'}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID do Usuário</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Data de Criação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((contact) => (
                    <TableRow key={contact.user_id}>
                      <TableCell className="font-mono">{contact.user_id}</TableCell>
                      <TableCell>{formatName(contact)}</TableCell>
                      <TableCell>{contact.username || 'N/A'}</TableCell>
                      <TableCell>{formatDate(contact.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages} ({filteredCount} contatos)
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContatosList;
