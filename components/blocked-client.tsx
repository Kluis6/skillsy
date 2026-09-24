'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Mail, MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';

export function BlockedClient() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/');
    } catch (error) {
      toast.error('Erro ao sair');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-card p-8 md:p-10 shadow-lg border border-border-subtle text-center">
        <div className="w-20 h-20 bg-destructive/10 flex items-center justify-center mx-auto mb-8">
          <ShieldAlert size={40} className="text-destructive" />
        </div>
        
        <h1 className="text-3xl font-bold text-text-main font-heading mb-4">Acesso Bloqueado</h1>
        
        <p className="text-text-muted mb-8 leading-relaxed">
          Sua conta foi temporariamente suspensa. Por favor, entre em contato com nossa equipe técnica para resolver esta situação.
        </p>

        <div className="space-y-4 mb-10">
          <a 
            href="mailto:suporte@skillsy.com" 
            className="flex items-center justify-center gap-3 p-4 bg-surface text-text-main font-semibold hover:bg-primary/5 transition-colors"
          >
            <Mail size={20} className="text-primary" /> suporte@skillsy.com
          </a>
          <Button
            type="button"
            variant="secondary"
            onClick={() => toast.info('Suporte Indisponível', { description: 'O suporte via WhatsApp está temporariamente fora do ar. Por favor, use o e-mail.' })}
            className="h-auto w-full gap-3 bg-surface p-4 text-sm font-semibold text-text-main hover:bg-success/10"
          >
            <MessageCircle size={20} className="text-success" /> Suporte via WhatsApp
          </Button>
        </div>

        <Button 
          onClick={handleLogout}
          variant="ghost" 
          className="w-full h-12 font-bold text-text-muted hover:text-primary"
        >
          Sair da conta
        </Button>
      </div>
    </div>
  );
}
