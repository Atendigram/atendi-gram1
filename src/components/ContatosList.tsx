import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Search, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { format } from 'date-fns';

interface Contact {
  user_id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  created_at: string;
}

const ITEMS_PER_PAGE = 25;

const ContatosList = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);

  useEffect(() => {
    loadContacts();
  }, [currentPage, searchTerm]);

  const loadContacts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('contatos_luna')
        .select('user_id, first_name, last_name, username, created_at', { count: 'exact' });

      // Apply search filter if exists
      if (searchTerm) {
        query = query.or(`user_id.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`);
      }

      // Apply pagination and ordering
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      setContacts(data || []);
      setFilteredCount(count || 0);
      
      // Get total count without filters for statistics
      if (!searchTerm) {
        setTotalCount(count || 0);
      } else if (currentPage === 1) {
        // Only fetch total count on first page when searching
        const { count: total } = await supabase
          .from('contatos_luna')
          .select('*', { count: 'exact', head: true });
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
          <CardTitle>Lista de Contatos</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por user_id, nome ou username..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="max-w-sm"
            />
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