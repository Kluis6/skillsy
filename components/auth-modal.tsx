'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogIn, Mail, Lock, User as UserIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function AuthModal({ children }: { children: React.ReactElement }) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      setOpen(false);
      toast.success('Bem-vindo ao Skillsy!');
    } catch (error: any) {
      toast.error('Erro ao entrar com Google');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      setOpen(false);
      toast.success('Bem-vindo de volta!');
    } catch (error: any) {
      toast.error('E-mail ou senha incorretos');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUpWithEmail(email, password, name);
      setOpen(false);
      toast.success('Conta criada com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao criar conta. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children} />
      <DialogContent className="sm:max-w-[400px] rounded-2xl border-border-subtle bg-white shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold tracking-tighter text-primary">
            SKILLS<span className="text-accent">Y</span>
          </DialogTitle>
          <DialogDescription className="text-text-muted">
            Conecte-se com a comunidade SUD.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <Button 
            variant="outline" 
            onClick={handleGoogleLogin} 
            disabled={loading}
            className="w-full rounded-xl border-border-subtle h-12 font-semibold hover:bg-background transition-colors"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Continuar com Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border-subtle" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
              <span className="bg-white px-2 text-text-muted">Ou use seu e-mail</span>
            </div>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-background rounded-xl p-1">
              <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold">Entrar</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold">Cadastrar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-text-muted">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted/50" size={16} />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="seu@email.com" 
                      className="pl-10 rounded-xl border-border-subtle focus-visible:ring-accent"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-text-muted">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted/50" size={16} />
                    <Input 
                      id="password" 
                      type="password" 
                      className="pl-10 rounded-xl border-border-subtle focus-visible:ring-accent"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-primary text-white hover:bg-primary/90 rounded-xl h-12 font-semibold">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Entrar'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleEmailSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-xs font-bold uppercase tracking-wider text-text-muted">Nome Completo</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted/50" size={16} />
                    <Input 
                      id="signup-name" 
                      placeholder="Seu nome" 
                      className="pl-10 rounded-xl border-border-subtle focus-visible:ring-accent"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-xs font-bold uppercase tracking-wider text-text-muted">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted/50" size={16} />
                    <Input 
                      id="signup-email" 
                      type="email" 
                      placeholder="seu@email.com" 
                      className="pl-10 rounded-xl border-border-subtle focus-visible:ring-accent"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-xs font-bold uppercase tracking-wider text-text-muted">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted/50" size={16} />
                    <Input 
                      id="signup-password" 
                      type="password" 
                      className="pl-10 rounded-xl border-border-subtle focus-visible:ring-accent"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-primary text-white hover:bg-primary/90 rounded-xl h-12 font-semibold">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Criar Conta'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
