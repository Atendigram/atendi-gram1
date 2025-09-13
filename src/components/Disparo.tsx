import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import { supabase, getAccountId } from '@/lib/supabase';
import { Send, Search, Upload, ChevronLeft, ChevronRight, FileText, Mic, Image } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { scopedSelectWithColumns, scopedInsert } from '@/lib/scoped-queries';

interface Contact {
  user_id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  chat_id?: number;
  created_at: string;
  name?: string; // Computed field from first_name + last_name
}

const ITEMS_PER_PAGE = 25;

const Disparo = () => {
  const { profile } = useAuth();
  const accountId = profile?.account_id;
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [messageType, setMessageType] = useState<'text' | 'audio' | 'photo'>('text');
  const [textMessage, setTextMessage] = useState('');
  const [intervalSeconds, setIntervalSeconds] = useState(0);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Load contacts
  useEffect(() => {
    if (accountId) {
      loadContacts();
    }
  }, [accountId]);

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
    if (!accountId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await scopedSelectWithColumns('contatos_geral', 'user_id, first_name, last_name, username, chat_id, created_at', accountId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Add computed name field
      const contactsWithName = (data as Contact[] || []).map(contact => ({
        ...contact,
        name: [contact.first_name, contact.last_name].filter(Boolean).join(' ') || ''
      }));
      
      setContacts(contactsWithName);
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
    setMediaUrl(null); // Reset previous uploads
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPhotoFile(file || null);
    setMediaUrl(null); // Reset previous uploads
  };

  const handleMessageTypeChange = (type: 'text' | 'audio' | 'photo') => {
    setMessageType(type);
    // Reset files when changing type
    setAudioFile(null);
    setPhotoFile(null);
    setMediaUrl(null);
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
    // Validation based on message type
    if (messageType === 'text' && !textMessage.trim()) {
      toast({
        title: "Erro de validação",
        description: "Você deve fornecer uma mensagem de texto",
        variant: "destructive",
      });
      return;
    }

    if (messageType === 'audio' && !audioFile) {
      toast({
        title: "Erro de validação",
        description: "Você deve selecionar um arquivo de áudio",
        variant: "destructive",
      });
      return;
    }

    if (messageType === 'photo' && !photoFile) {
      toast({
        title: "Erro de validação",
        description: "Você deve selecionar uma imagem",
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
      // Get account_id from session
      const currentAccountId = await getAccountId();
      if (!currentAccountId) {
        throw new Error('Não foi possível obter o ID da conta');
      }

      let finalMediaUrl: string | null = mediaUrl;
      
      // Upload media file if provided
      if (messageType === 'audio' && audioFile) {
        setUploading(true);
        const ext = audioFile.name.split(".").pop() || "ogg";
        const path = `voices/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("audios").upload(path, audioFile, {
          cacheControl: "3600",
          upsert: false,
        });
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage.from("audios").getPublicUrl(path);
        finalMediaUrl = data.publicUrl;
        setMediaUrl(data.publicUrl);
        setUploading(false);
      }

      if (messageType === 'photo' && photoFile) {
        setUploading(true);
        const ext = photoFile.name.split(".").pop() || "jpg";
        const path = `images/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("photos").upload(path, photoFile, {
          cacheControl: "3600",
          upsert: false,
        });
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage.from("photos").getPublicUrl(path);
        finalMediaUrl = data.publicUrl;
        setMediaUrl(data.publicUrl);
        setUploading(false);
      }

      // Step 1: Create disparo record
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('Usuário não autenticado');
      }

      const { data: campaign, error: campaignError } = await supabase
        .from('disparos')
        .insert({
          account_id: currentAccountId,
          name: `Disparo ${messageType} ${new Date().toLocaleDateString()}`,
          content: messageType === 'text' ? textMessage.trim() : null,
          text_message: messageType === 'text' ? textMessage.trim() : null,
          audio_url: messageType === 'audio' ? finalMediaUrl : null,
          media_url: finalMediaUrl,
          interval_seconds: intervalSeconds,
          status: 'scheduled',
          created_by: session.user.id
        })
        .select()
        .single();

      if (campaignError) {
        console.error('Campaign error:', campaignError);
        throw new Error(campaignError.message || 'Erro ao criar disparo');
      }

      // Step 2: Get selected contacts with chat_id
      const selectedContactsList = contacts.filter(contact => 
        selectedContacts.has(contact.user_id) && contact.chat_id
      );

      if (selectedContactsList.length === 0) {
        throw new Error('Nenhum dos contatos selecionados possui chat_id válido');
      }

      // Step 3: Create disparo_items in chunks of 500
      const chunkSize = 500;
      const now = new Date();
      
      for (let i = 0; i < selectedContactsList.length; i += chunkSize) {
        const chunk = selectedContactsList.slice(i, i + chunkSize);
        const disparoItems = chunk.map((contact, index) => {
          // Calculate scheduled time with interval
          const scheduledAt = new Date(now.getTime() + (index * intervalSeconds * 1000));
          
          return {
            account_id: currentAccountId,
            campaign_id: campaign.id,
            user_id: contact.user_id.toString(),
            tg_id: contact.user_id.toString(),
            type: messageType,
            message: messageType === 'text' ? textMessage.trim() : textMessage.trim() || null, // Caption for media
            media_url: finalMediaUrl,
            payload: {
              type: messageType,
              text: messageType === 'text' ? textMessage.trim() : (textMessage.trim() || undefined),
              media_url: finalMediaUrl || undefined
            },
            status: 'queued',
            scheduled_at: scheduledAt.toISOString(),
            created_at: new Date().toISOString()
          };
        });

        const { error: itemsError } = await supabase
          .from('disparo_items')
          .insert(disparoItems);

        if (itemsError) {
          console.error('Items error:', itemsError);
          throw new Error(itemsError.message || 'Erro ao criar itens do disparo');
        }
      }

      // Success
      toast({
        title: "Sucesso",
        description: `Disparo criado com sucesso para ${selectedContactsList.length} contatos`,
      });

      // Clear form
      setTextMessage('');
      setAudioFile(null);
      setPhotoFile(null);
      setMediaUrl(null);
      setIntervalSeconds(0);
      setSelectedContacts(new Set());

    } catch (error: any) {
      console.error('Error creating disparo:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar disparo",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
      setUploading(false);
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por user_id, nome ou username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newSelected = new Set(selectedContacts);
                filteredContacts.forEach(contact => newSelected.add(contact.user_id));
                setSelectedContacts(newSelected);
              }}
              disabled={filteredContacts.length === 0}
            >
              Selecionar Todos ({filteredContacts.length})
            </Button>
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
        <CardContent className="space-y-6">
          {/* Message Type Selection */}
          <div>
            <Label className="text-sm font-medium">Tipo de Mensagem</Label>
            <RadioGroup 
              value={messageType} 
              onValueChange={handleMessageTypeChange}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="text" id="text" />
                <Label htmlFor="text" className="flex items-center gap-2 cursor-pointer">
                  <FileText className="h-4 w-4" />
                  Texto
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="audio" id="audio" />
                <Label htmlFor="audio" className="flex items-center gap-2 cursor-pointer">
                  <Mic className="h-4 w-4" />
                  Áudio
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="photo" id="photo" />
                <Label htmlFor="photo" className="flex items-center gap-2 cursor-pointer">
                  <Image className="h-4 w-4" />
                  Foto
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Text Message */}
          {messageType === 'text' && (
            <div>
              <Label className="text-sm font-medium">Mensagem de Texto</Label>
              <Textarea
                placeholder="Digite sua mensagem..."
                value={textMessage}
                onChange={(e) => setTextMessage(e.target.value)}
                className="mt-1"
                required={messageType === 'text'}
              />
            </div>
          )}

          {/* Audio Upload */}
          {messageType === 'audio' && (
            <div>
              <Label className="text-sm font-medium">Arquivo de Áudio</Label>
              <div className="mt-1 space-y-2">
                <Input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioSelect}
                  disabled={uploading}
                  className="max-w-sm"
                  required={messageType === 'audio'}
                />
                {uploading && <p className="text-sm text-muted-foreground">Carregando áudio...</p>}
                {audioFile && (
                  <div className="space-y-2">
                    <p className="text-sm text-green-600">Áudio selecionado: {audioFile.name}</p>
                    <audio src={URL.createObjectURL(audioFile)} controls className="w-full max-w-md" />
                  </div>
                )}
                {mediaUrl && messageType === 'audio' && (
                  <div className="space-y-2">
                    <p className="text-sm text-blue-600">Áudio carregado com sucesso</p>
                    <audio src={mediaUrl} controls className="w-full max-w-md" />
                  </div>
                )}
                {/* Optional caption for audio */}
                <div>
                  <Label className="text-sm font-medium">Legenda (Opcional)</Label>
                  <Textarea
                    placeholder="Digite uma legenda para o áudio..."
                    value={textMessage}
                    onChange={(e) => setTextMessage(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Photo Upload */}
          {messageType === 'photo' && (
            <div>
              <Label className="text-sm font-medium">Arquivo de Imagem</Label>
              <div className="mt-1 space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  disabled={uploading}
                  className="max-w-sm"
                  required={messageType === 'photo'}
                />
                {uploading && <p className="text-sm text-muted-foreground">Carregando imagem...</p>}
                {photoFile && (
                  <div className="space-y-2">
                    <p className="text-sm text-green-600">Imagem selecionada: {photoFile.name}</p>
                    <img 
                      src={URL.createObjectURL(photoFile)} 
                      alt="Preview" 
                      className="max-w-md max-h-48 object-contain rounded-lg border"
                    />
                  </div>
                )}
                {mediaUrl && messageType === 'photo' && (
                  <div className="space-y-2">
                    <p className="text-sm text-blue-600">Imagem carregada com sucesso</p>
                    <img 
                      src={mediaUrl} 
                      alt="Uploaded" 
                      className="max-w-md max-h-48 object-contain rounded-lg border"
                    />
                  </div>
                )}
                {/* Optional caption for photo */}
                <div>
                  <Label className="text-sm font-medium">Legenda (Opcional)</Label>
                  <Textarea
                    placeholder="Digite uma legenda para a imagem..."
                    value={textMessage}
                    onChange={(e) => setTextMessage(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Interval Setting */}
          <div>
            <Label className="text-sm font-medium">Intervalo entre envios (segundos)</Label>
            <Input
              type="number"
              min="0"
              value={intervalSeconds}
              onChange={(e) => setIntervalSeconds(parseInt(e.target.value) || 0)}
              className="mt-1 max-w-xs"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitting || uploading || selectedContacts.size === 0}
            className="w-full"
          >
            {submitting || uploading ? (
              uploading ? "Carregando arquivo..." : "Enviando..."
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar {messageType === 'text' ? 'Texto' : messageType === 'audio' ? 'Áudio' : 'Foto'} ({selectedContacts.size} contatos)
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Disparo;