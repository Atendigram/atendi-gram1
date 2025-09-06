import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard', { replace: true });
      }
    };
    checkSession();
  }, [navigate]);

  // Sign in handler
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail || !signInPassword) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signInEmail,
        password: signInPassword,
      });

      if (error) {
        toast({
          title: "Erro no login",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.session) {
        toast({
          title: "Sucesso!",
          description: "Login realizado com sucesso",
        });
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Sign up handler
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpEmail || !signUpPassword || !confirmPassword) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    if (signUpPassword.length < 8) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 8 caracteres",
        variant: "destructive",
      });
      return;
    }

    if (signUpPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signUpEmail,
        password: signUpPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        toast({
          title: "Erro no cadastro",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.session) {
        toast({
          title: "Conta criada!",
          description: "Sua conta foi criada com sucesso",
        });
        navigate('/dashboard', { replace: true });
      } else if (data.user && !data.session) {
        toast({
          title: "Verifique seu email",
          description: "Enviamos um link de confirmação para seu email",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Password reset handler
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast({
        title: "Erro",
        description: "Por favor, informe seu email",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Email enviado!",
        description: "Verifique seu email para resetar sua senha",
      });
      setShowResetForm(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (showResetForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Resetar Senha</CardTitle>
            <CardDescription>
              Informe seu email para receber as instruções
            </CardDescription>
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">AtendiGram</CardTitle>
          <CardDescription>
            Entre na sua conta ou crie uma nova
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar Conta</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4">
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
                      disabled={loading}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Sua senha"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      className="pl-10 pr-10"
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked === true)}
                      disabled={loading}
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
                    disabled={loading}
                  >
                    Esqueci a senha
                  </Button>
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Entrar
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
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
                      disabled={loading}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 8 caracteres"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      className="pl-10 pr-10"
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirme sua senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10"
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={loading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar Conta
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;