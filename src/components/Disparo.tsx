import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Send, Search, Upload, ChevronLeft, ChevronRight } from 'lucide-react';

interface Contact {
  user_id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  created_at: string;
}

const ITEMS_PER_PAGE = 25;

const Disparo = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [textMessage, setTextMessage] = useState('');
  const [intervalSeconds, setIntervalSeconds] = useState(0);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUploading, setAudioUploading] = useState(false);

  // Load contacts
  useEffect(() => {
    loadContacts();
  }, []);

  // Filter contacts based on search
  useEffect(() => {
    if (!searchTerm) {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter(contact => 
        contact.user_id.toString().includes(searchTerm) ||
        contact.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredContacts(filtered);
    }
    setCurrentPage(1);
  }, [contacts, searchTerm]);

  const loadContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contatos_luna')
        .select('user_id, first_name, last_name, username, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
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

  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setAudioFile(file || null);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentPageContacts = getCurrentPageContacts();
      const newSelected = new Set(selectedContacts);
      currentPageContacts.forEach(contact => newSelected.add(contact.user_id));
      setSelectedContacts(newSelected);
    } else {
      const currentPageContacts = getCurrentPageContacts();
      const newSelected = new Set(selectedContacts);
      currentPageContacts.forEach(contact => newSelected.delete(contact.user_id));
      setSelectedContacts(newSelected);
    }
  };

  const handleSelectContact = (userId: number, checked: boolean) => {
    const newSelected = new Set(selectedContacts);
    if (checked) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedContacts(newSelected);
  };

  const getCurrentPageContacts = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredContacts.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredContacts.length / ITEMS_PER_PAGE);
  const currentPageContacts = getCurrentPageContacts();
  const allCurrentPageSelected = currentPageContacts.length > 0 && 
    currentPageContacts.every(contact => selectedContacts.has(contact.user_id));

  const handleSubmit = async () => {
    // Validation
    if (!textMessage.trim() && !audioFile) {
      toast({
        title: "Erro de validação",
        description: "Você deve fornecer uma mensagem de texto ou um áudio",
        variant: "destructive",
      });
      return;
    }

    if (selectedContacts.size === 0) {
      toast({
        title: "Erro de validação", 
        description: "Selecione pelo menos um contato",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      let audioUrl = null;
      
      // Upload audio if provided
      if (audioFile) {
        setAudioUploading(true);
        const ext = audioFile.name.split(".").pop() || "ogg";
        const path = `voices/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("audios").upload(path, audioFile, {
          cacheControl: "3600",
          upsert: false,
        });
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage.from("audios").getPublicUrl(path);
        audioUrl = data.publicUrl;
        setAudioUploading(false);
      }

      // Insert disparo
      const { data: disparo, error: disparoError } = await supabase
        .from('disparos')
        .insert({
          text_message: textMessage.trim() || null,
          audio_url: audioUrl,
          interval_seconds: intervalSeconds,
          status: 'pending'
        })
        .select()
        .single();

      if (disparoError) throw disparoError;

      // Insert disparo_items in chunks of 500
      const contactIds = Array.from(selectedContacts);
      const chunkSize = 500;
      
      for (let i = 0; i < contactIds.length; i += chunkSize) {
        const chunk = contactIds.slice(i, i + chunkSize);
        const disparoItems = chunk.map(userId => ({
          disparo_id: disparo.id,
          user_id: userId.toString(),
          status: 'pending'
        }));

        const { error: itemsError } = await supabase
          .from('disparo_items')
          .insert(disparoItems);

        if (itemsError) throw itemsError;
      }

      // Success
      toast({
        title: "Sucesso",
        description: `Disparo criado com sucesso para ${selectedContacts.size} contatos`,
      });

      // Clear form
      setTextMessage('');
      setAudioFile(null);
      setIntervalSeconds(0);
      setSelectedContacts(new Set());

    } catch (error) {
      console.error('Error creating disparo:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar disparo",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
      setAudioUploading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Carregando contatos...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Contatos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contacts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selecionados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedContacts.size}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Filtrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredContacts.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Contacts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contatos</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por user_id, nome ou username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={allCurrentPageSelected}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Criado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPageContacts.map((contact) => (
                <TableRow key={contact.user_id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedContacts.has(contact.user_id)}
                      onCheckedChange={(checked) => handleSelectContact(contact.user_id, !!checked)}
                    />
                  </TableCell>
                  <TableCell>{contact.user_id}</TableCell>
                  <TableCell>
                    {[contact.first_name, contact.last_name].filter(Boolean).join(' ') || '-'}
                  </TableCell>
                  <TableCell>{contact.username || '-'}</TableCell>
                  <TableCell>{new Date(contact.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages} ({filteredContacts.length} contatos)
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Composer */}
      <Card>
        <CardHeader>
          <CardTitle>Novo Disparo</CardTitle>
          <CardDescription>
            Configure e envie mensagens para os contatos selecionados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Mensagem de Texto (Opcional)</label>
            <Textarea
              placeholder="Digite sua mensagem..."
              value={textMessage}
              onChange={(e) => setTextMessage(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Intervalo (segundos)</label>
            <Input
              type="number"
              min="0"
              value={intervalSeconds}
              onChange={(e) => setIntervalSeconds(parseInt(e.target.value) || 0)}
              className="mt-1 max-w-xs"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Áudio (Opcional)</label>
            <div className="mt-1 space-y-2">
              <Input
                type="file"
                accept="audio/*"
                onChange={handleAudioSelect}
                disabled={audioUploading}
                className="max-w-sm"
              />
              {audioUploading && <p className="text-sm text-muted-foreground">Carregando áudio...</p>}
              {audioFile && (
                <div className="space-y-2">
                  <p className="text-sm text-green-600">Áudio selecionado: {audioFile.name}</p>
                  <audio src={URL.createObjectURL(audioFile)} controls className="w-full max-w-md" />
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitting || selectedContacts.size === 0}
            className="w-full"
          >
            {submitting ? (
              "Enviando..."
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar Disparo ({selectedContacts.size} contatos)
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Disparo;