import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Search, ChevronLeft, ChevronRight, Users, Download } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { scopedSelectWithColumns, scopedCount } from '@/lib/scoped-queries';

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
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (accountId) {
      loadContacts();
    }
  }, [currentPage, searchTerm, accountId]);

  const loadContacts = async () => {
    if (!accountId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let query = scopedSelectWithColumns('contatos_luna', 'user_id, first_name, last_name, username, created_at', accountId);

      // Apply search filter if exists
      if (searchTerm) {
        const isNumeric = /^\d+$/.test(searchTerm);
        if (isNumeric) {
          // If search term is numeric, search user_id as exact match and text fields with ilike
          query = query.or(`user_id.eq.${searchTerm},first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`);
        } else {
          // If search term is not numeric, only search text fields
          query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`);
        }
      }

      // Apply pagination and ordering
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      setContacts((data as Contact[]) || []);
      setFilteredCount(count || 0);
      
      // Get total count without filters for statistics
      if (!searchTerm) {
        setTotalCount(count || 0);
      } else if (currentPage === 1) {
        // Only fetch total count on first page when searching
        const { count: total } = await scopedCount('contatos_luna', accountId);
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

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const escapeCSVField = (field: string | number | null | undefined): string => {
    if (field === null || field === undefined) return '""';
    const str = String(field);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return `"${str}"`;
  };

  const exportToCSV = async () => {
    if (!accountId) return;
    
    setExporting(true);
    try {
      const BATCH_SIZE = 2000;
      let allContacts: Contact[] = [];
      let offset = 0;
      let hasMore = true;

      // Fetch all filtered data in batches
      while (hasMore) {
        let query = scopedSelectWithColumns('contatos_luna', 'user_id, first_name, last_name, username, created_at', accountId);

        // Apply the same search filter
        if (searchTerm) {
          const isNumeric = /^\d+$/.test(searchTerm);
          if (isNumeric) {
            // If search term is numeric, search user_id as exact match and text fields with ilike
            query = query.or(`user_id.eq.${searchTerm},first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`);
          } else {
            // If search term is not numeric, only search text fields
            query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`);
          }
        }

        const { data, error } = await query
          .order('created_at', { ascending: false })
          .range(offset, offset + BATCH_SIZE - 1);

        if (error) throw error;

        if (!data || data.length === 0) {
          hasMore = false;
        } else {
          allContacts = [...allContacts, ...(data as Contact[])];
          offset += BATCH_SIZE;
          hasMore = data.length === BATCH_SIZE;
        }
      }

      if (allContacts.length === 0) {
        toast({
          title: "Aviso",
          description: "Nenhum contato encontrado para exportar",
          variant: "default",
        });
        return;
      }

      // Create CSV content
      const headers = ['user_id', 'name', 'username', 'created_at'];
      const csvRows = [headers.join(',')];

      allContacts.forEach(contact => {
        const name = [contact.first_name || '', contact.last_name || ''].filter(Boolean).join(' ') || '';
        const row = [
          escapeCSVField(contact.user_id),
          escapeCSVField(name),
          escapeCSVField(contact.username),
          escapeCSVField(formatDate(contact.created_at))
        ];
        csvRows.push(row.join(','));
      });

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

      // Create download link
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      const today = format(new Date(), 'yyyy-MM-dd');
      
      link.setAttribute('href', url);
      link.setAttribute('download', `contatos_${today}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Sucesso",
        description: `${allContacts.length} contatos exportados para CSV`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error exporting contacts:', error);
      toast({
        title: "Erro",
        description: "Não foi possível exportar os contatos",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  if (!accountId) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <p className="text-muted-foreground">Carregando informações da conta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with counters */}
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
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Filtrados</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredCount.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contacts table */}
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
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium text-foreground">Nenhum contato encontrado</h3>
              <p className="mt-2 text-muted-foreground">
                {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Ainda não há contatos cadastrados.'}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead className="text-right">Data de Cadastro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((contact) => (
                    <TableRow key={contact.user_id}>
                      <TableCell className="font-mono">{contact.user_id}</TableCell>
                      <TableCell>{formatName(contact)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {contact.username ? `@${contact.username}` : 'Sem username'}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatDate(contact.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages} ({filteredCount.toLocaleString()} contatos)
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={currentPage <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage >= totalPages}
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4" />
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