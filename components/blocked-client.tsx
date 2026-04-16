'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Mail, MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';

export function BlockedClient() {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = '/';
    } catch (error) {
      toast.error('Erro ao sair');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-primary/10 border border-border-subtle text-center">
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <ShieldAlert size={40} className="text-red-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-text-main font-heading mb-4">Acesso Bloqueado</h1>
        
        <p className="text-text-muted mb-8 leading-relaxed">
          Sua conta foi temporariamente suspensa. Por favor, entre em contato com nossa equipe técnica para resolver esta situação.
        </p>

        <div className="space-y-4 mb-10">
          <a 
            href="mailto:suporte@skillsy.com" 
            className="flex items-center justify-center gap-3 p-4 bg-surface rounded-2xl text-text-main font-semibold hover:bg-primary/5 transition-colors"
          >
            <Mail size={20} className="text-primary" /> suporte@skillsy.com
          </a>
          <button 
            onClick={() => toast.info('Suporte Indisponível', { description: 'O suporte via WhatsApp está temporariamente fora do ar. Por favor, use o e-mail.' })}
            className="flex items-center justify-center gap-3 p-4 bg-surface rounded-2xl text-text-main font-semibold hover:bg-green-50 transition-colors w-full border-none cursor-pointer"
          >
            <MessageCircle size={20} className="text-green-500" /> Suporte via WhatsApp
          </button>
        </div>

        <Button 
          onClick={handleLogout}
          variant="ghost" 
          className="w-full h-12 rounded-xl font-bold text-text-muted hover:text-primary"
        >
          Sair da Conta
        </Button>
      </div>
    </div>
  );
}
