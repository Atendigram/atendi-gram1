import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Phone, Key, Hash, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useOnboardingStatus } from '@/hooks/use-onboarding-status';
import { useNavigate } from 'react-router-dom';

interface FormData {
  apiId: string;
  apiHash: string;
  phoneNumber: string;
}

interface VerificationData {
  code: string;
  password: string;
}

const ConectarPerfilPage = () => {
  const { profile, loadAccountData } = useAuth();
  const { refreshStatus } = useOnboardingStatus();
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'verification'>('form');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    apiId: '',
    apiHash: '',
    phoneNumber: '+55'
  });
  
  const [verificationData, setVerificationData] = useState<VerificationData>({
    code: '',
    password: ''
  });

  const [error, setError] = useState<string | null>(null);

  // Check for existing connected session on mount and redirect to dashboard if found
  useEffect(() => {
    let isMounted = true;

    const checkExistingConnection = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.id || !isMounted) {
          isMounted && setInitialLoading(false);
          return;
        }

        // Get user's profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, account_id')
          .eq('id', user.id)
          .maybeSingle();

        if (!profile || !isMounted) {
          isMounted && setInitialLoading(false);
          return;
        }

        // Checa diretamente em telegram_sessions se há sessão conectada do perfil ou da conta
        const { data: connectedSessions, error: sessionsError } = await supabase
          .from('telegram_sessions')
          .select('id')
          .eq('status', 'connected')
          .in('owner_id', [profile.id, profile.account_id]);

        if (sessionsError) {
          console.error('❌ ConectarPerfil - Erro ao buscar telegram_sessions:', sessionsError);
        }

        const telegramCheck = Array.isArray(connectedSessions) && connectedSessions.length > 0 ? connectedSessions[0] : null;

        // Only redirect if session is connected, otherwise allow user to stay
        if (telegramCheck && isMounted) {
          navigate('/dashboard', { replace: true });
          return;
        }

        isMounted && setInitialLoading(false);
      } catch (error) {
        console.error('Error checking connection:', error);
        isMounted && setInitialLoading(false);
      }
    };

    checkExistingConnection();

    return () => {
      isMounted = false;
    };
  }, [navigate]);


  const handleFormChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleVerificationChange = (field: keyof VerificationData, value: string) => {
    setVerificationData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleGerarConexao = async () => {
    if (!formData.apiId || !formData.apiHash || !formData.phoneNumber) {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    if (!formData.phoneNumber.startsWith('+')) {
      setError('Número de telefone deve começar com + e código do país.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Try to load account data (non-blocking)
      await loadAccountData().catch(() => {});
      
      // Get fresh profile data from database
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não encontrado. Faça login novamente.');
      }

      // Get account id from accounts table (owner_id = current user)
      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (accountError || !accountData?.id) {
        throw new Error('Conta não encontrada. Verifique seu cadastro.');
      }

      const { data, error } = await (supabase as any)
        .from('telegram_sessions')
        .insert({
          phone_number: formData.phoneNumber,
          api_id: formData.apiId,
          api_hash: formData.apiHash,
          owner_id: accountData.id,
          status: 'pending'
        })
        .select('id')
        .single();

      if (error) throw error;
      
      // Store the session ID for step 2
      setSessionId(data.id);

      setStep('verification');
      toast.success('Profile registered, waiting for connection...');
    } catch (err: any) {
      console.error('Erro ao criar sessão:', err);
      setError(err.message || 'Erro ao salvar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmar = async () => {
    if (!verificationData.code) {
      setError('Código de verificação é obrigatório.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get current user's account_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não encontrado. Faça login novamente.');
      }

      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (accountError || !accountData?.id) {
        throw new Error('Conta não encontrada. Verifique seu cadastro.');
      }

      // First, try to update the most recent row with same owner_id and phone_number
      const { data: existingRows, error: selectError } = await (supabase as any)
        .from('telegram_sessions')
        .select('id')
        .eq('owner_id', accountData.id)
        .eq('phone_number', formData.phoneNumber)
        .order('created_at', { ascending: false })
        .limit(1);

      if (selectError) throw selectError;

      if (existingRows && existingRows.length > 0) {
        // Update existing row
        const { error: updateError } = await supabase
          .from('telegram_sessions')
          .update({
            verification_code: verificationData.code,
            twofa_password: verificationData.password || null,
            status: 'verifying'
          })
          .eq('id', existingRows[0].id);

        if (updateError) throw updateError;
      } else {
        // No existing row found, insert a new one
        const { error: insertError } = await (supabase as any)
          .from('telegram_sessions')
          .insert({
            phone_number: formData.phoneNumber,
            api_id: formData.apiId,
            api_hash: formData.apiHash,
            owner_id: accountData.id,
            verification_code: verificationData.code,
            twofa_password: verificationData.password || null,
            status: 'verifying'
          });

        if (insertError) throw insertError;
      }

      toast.success('Código enviado para verificação!');
      
      // Refresh onboarding status and redirect to welcome configuration
      refreshStatus();
      navigate('/boas-vindas');
      
      // Reset form
      setStep('form');
      setFormData({ apiId: '', apiHash: '', phoneNumber: '+55' });
      setVerificationData({ code: '', password: '' });
      setSessionId(null);
    } catch (err: any) {
      console.error('Erro ao confirmar código:', err);
      setError(err.message || 'Erro ao confirmar código. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleVoltar = () => {
    setStep('form');
    setSessionId(null);
    setVerificationData({ code: '', password: '' });
    setError(null);
  };

  // Show loading screen during initial check
  if (initialLoading) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Verificando conexão existente...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Conectar Perfil</h1>
          <p className="text-muted-foreground">
            Configure sua conexão com o Telegram para enviar mensagens
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {step === 'form' ? (
            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Key className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Dados da API do Telegram</h2>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiId">API ID</Label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="apiId"
                        placeholder="Digite seu API ID"
                        value={formData.apiId}
                        onChange={(e) => handleFormChange('apiId', e.target.value)}
                        className="pl-10"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apiHash">API Hash</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="apiHash"
                        placeholder="Digite seu API Hash"
                        value={formData.apiHash}
                        onChange={(e) => handleFormChange('apiHash', e.target.value)}
                        className="pl-10"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Número de Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phoneNumber"
                      placeholder="+5511999999999"
                      value={formData.phoneNumber}
                      onChange={(e) => handleFormChange('phoneNumber', e.target.value)}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Inclua o código do país (+55 para Brasil)
                  </p>
                </div>

                <Button 
                  onClick={handleGerarConexao} 
                  disabled={loading}
                  className="w-full md:w-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    'Gerar Conexão'
                  )}
                </Button>

                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-medium mb-2">Como obter API ID e Hash:</h3>
                  <ol className="text-sm text-muted-foreground space-y-1">
                    <li>1. Acesse <a href="https://my.telegram.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">my.telegram.org</a></li>
                    <li>2. Faça login com seu número do Telegram</li>
                    <li>3. Vá em "API development tools"</li>
                    <li>4. Preencha o formulário para criar um app</li>
                    <li>5. Copie o API ID e API Hash gerados</li>
                  </ol>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Verificação</h2>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Um código de verificação foi enviado para <strong>{formData.phoneNumber}</strong>
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Código de Verificação</Label>
                    <Input
                      id="code"
                      placeholder="Digite o código recebido"
                      value={verificationData.code}
                      onChange={(e) => handleVerificationChange('code', e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Senha 2FA (opcional)</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Digite sua senha 2FA se habilitada"
                      value={verificationData.password}
                      onChange={(e) => handleVerificationChange('password', e.target.value)}
                      disabled={loading}
                    />
                    <p className="text-sm text-muted-foreground">
                      Apenas se você tiver autenticação de dois fatores habilitada
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="outline" 
                    onClick={handleVoltar}
                    disabled={loading}
                    className="w-full sm:w-auto"
                  >
                    Voltar
                  </Button>
                  <Button 
                    onClick={handleConfirmar} 
                    disabled={loading}
                    className="w-full sm:w-auto"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Confirmando...
                      </>
                    ) : (
                      'Confirmar'
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default ConectarPerfilPage;