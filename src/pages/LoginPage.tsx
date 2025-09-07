import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Mail, Lock, Eye, EyeOff, Send, LogIn, UserPlus } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { session, loading: authLoading } = useAuth();

  // Sign in form
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Sign up form
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password reset
  const [resetEmail, setResetEmail] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);

  // Active tab state
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  // Se já estiver logado, manda pro dashboard (simplificado para evitar loops)
  useEffect(() => {
    if (session) {
      console.log('🔀 User is logged in, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [session]);  // Removido authLoading e navigate das dependências

  // ========= SIGN IN =========
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signInEmail || !signInPassword) {
      toast({ title: 'Erro', description: 'Preencha email e senha.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signInEmail,
        password: signInPassword,
      });

      if (error) {
        toast({ title: 'Erro no login', description: error.message, variant: 'destructive' });
        return;
      }

      if (!data?.session) {
        toast({ title: 'Erro no login', description: 'Sessão não retornada pela API.', variant: 'destructive' });
        return;
      }

      // ✅ sucesso
      if (rememberMe) {
        // opcional: persistir último email
        try { localStorage.setItem('last_login_email', signInEmail); } catch {}
      }
      toast({ title: 'Sucesso!', description: 'Login realizado com sucesso.' });
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      toast({ title: 'Erro inesperado', description: err?.message ?? 'Falha desconhecida', variant: 'destructive' });
    } finally {
      setLoading(false); // 🔒 SEMPRE destrava o botão
    }
  };

  // ========= SIGN UP =========
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signUpEmail || !signUpPassword || !confirmPassword) {
      toast({ title: 'Erro', description: 'Preencha todos os campos.', variant: 'destructive' });
      return;
    }
    if (signUpPassword.length < 8) {
      toast({ title: 'Erro', description: 'A senha deve ter pelo menos 8 caracteres.', variant: 'destructive' });
      return;
    }
    if (signUpPassword !== confirmPassword) {
      toast({ title: 'Erro', description: 'As senhas não coincidem.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signUpEmail,
        password: signUpPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        toast({ title: 'Erro no cadastro', description: error.message, variant: 'destructive' });
        return;
      }

      if (data.session) {
        toast({ title: 'Conta criada!', description: 'Login automático realizado.' });
        navigate('/dashboard', { replace: true });
      } else if (data.user && !data.session) {
        toast({ title: 'Verifique seu email', description: 'Enviamos um link de confirmação.' });
      }
    } catch (err: any) {
      toast({ title: 'Erro inesperado', description: err?.message ?? 'Falha desconhecida', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // ========= RESET PASSWORD =========
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetEmail) {
      toast({ title: 'Erro', description: 'Informe seu email.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({ title: 'Erro', description: error.message, variant: 'destructive' });
        return;
      }

      toast({ title: 'Email enviado!', description: 'Cheque sua caixa de entrada.' });
      setShowResetForm(false);
    } catch (err: any) {
      toast({ title: 'Erro inesperado', description: err?.message ?? 'Falha desconhecida', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (showResetForm) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="fixed inset-0 -z-10">
          <img
            src="/lovable-uploads/b7c800d7-b10e-4dfe-99ca-130e1c18b8e0.png"
            alt=""
            className="h-full w-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-white/45 dark:bg-black/45 backdrop-blur-[2px]" />
        </div>
        <Card className="max-w-[360px] md:max-w-[380px] w-full p-4 md:p-6 rounded-2xl border border-white/30 bg-white/70 dark:bg-neutral-900/60 backdrop-blur-xl shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Resetar Senha</CardTitle>
            <CardDescription>Informe seu email para receber as instruções</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enviar Instruções
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setShowResetForm(false)}
                  disabled={loading}
                >
                  Voltar para o login
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="fixed inset-0 -z-10">
        <img
          src="/lovable-uploads/b7c800d7-b10e-4dfe-99ca-130e1c18b8e0.png"
          alt=""
          className="h-full w-full object-cover"
          loading="eager"
          fetchPriority="high"
        />
      </div>

      <Card className="max-w-[320px] md:max-w-[340px] w-full p-4 md:p-6 rounded-2xl border border-white/30 bg-white/70 dark:bg-neutral-900/60 backdrop-blur-xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Send className="h-6 w-6 text-primary" />
            AtendiGram
          </CardTitle>
          <CardDescription>Entre na sua conta ou crie uma nova</CardDescription>
        </CardHeader>

        <CardContent>
          {/* Segmented control simples */}
          <div className="flex w-full max-w-[360px] items-center gap-1 rounded-xl p-1 bg-white/60 dark:bg-neutral-900/50 backdrop-blur ring-1 ring-black/5 mb-6">
            <button
              role="tab"
              onClick={() => setActiveTab('signin')}
              className={`inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap leading-none px-4 py-2 sm:text-sm text-[13px] rounded-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                activeTab === 'signin'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-white/70 dark:hover:bg-white/10'
              }`}
            >
              <LogIn className="h-4 w-4 shrink-0" />
              <span>Entrar</span>
            </button>
            <button
              role="tab"
              onClick={() => setActiveTab('signup')}
              className={`inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap leading-none px-4 py-2 sm:text-sm text-[13px] rounded-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                activeTab === 'signup'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-white/70 dark:hover:bg-white/10'
              }`}
            >
              <UserPlus className="h-4 w-4 shrink-0" />
              <span>Criar Conta</span>
            </button>
          </div>

          {/* Sign In */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    className="pl-10"
                    autoComplete="email"
                    disabled={false}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signin-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Sua senha"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    className="pl-10 pr-10"
                    autoComplete="current-password"
                    disabled={false}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                  />
                  <Label htmlFor="remember" className="text-sm">
                    Lembrar-me
                  </Label>
                </div>

                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto text-sm"
                  onClick={() => setShowResetForm(true)}
                >
                  Esqueci a senha
                </Button>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Entrar
              </Button>
            </form>
          )}

          {/* Sign Up */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 8 caracteres"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirme sua senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Conta
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;