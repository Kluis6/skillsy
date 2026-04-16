'use client';

import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { AdminNavbar } from '@/components/admin-navbar';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-text-muted uppercase tracking-widest">Carregando Painel...</p>
        </div>
      </div>
    );
  }

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-6">
        <div className="max-w-md w-full bg-card rounded-[2.5rem] p-10 text-center shadow-2xl border border-border-subtle">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ShieldAlert size={40} />
          </div>
          <h2 className="text-2xl font-bold text-text-main mb-4 font-heading">Acesso Negado</h2>
          <p className="text-text-muted mb-8">
            Você não tem permissões administrativas para acessar esta área. Se você é um administrador, certifique-se de estar logado com a conta correta.
          </p>
          <Link href="/">
            <Button className="w-full bg-primary text-white font-bold h-12 rounded-2xl shadow-lg shadow-primary/20">
              Voltar para Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface/30">
      <AdminNavbar />
      <div className="max-w-[1600px] mx-auto">
        {children}
      </div>
    </div>
  );
}
