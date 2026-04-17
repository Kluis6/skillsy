'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ShieldAlert, RotateCcw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin Panel Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-surface text-center">
      <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/20 text-amber-600 rounded-full flex items-center justify-center mb-6">
        <ShieldAlert size={40} />
      </div>
      
      <h1 className="text-3xl font-bold text-text-main mb-4 font-heading">Erro no Painel Administrativo</h1>
      <p className="text-text-muted max-w-md mb-10 leading-relaxed">
        Não foi possível processar sua solicitação administrativa. Isso pode ser um erro temporário de conexão com o banco de dados.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={() => reset()}
          className="bg-primary text-white hover:bg-primary/90 rounded-2xl px-8 h-12 font-bold shadow-lg shadow-primary/20"
        >
          <RotateCcw size={18} className="mr-2" /> Tentar Novamente
        </Button>
        
        <Link href="/admin">
          <Button 
            variant="outline"
            className="rounded-2xl px-8 h-12 font-bold border-border-subtle hover:bg-surface"
          >
            <ArrowLeft size={18} className="mr-2" /> Voltar ao Dashboard
          </Button>
        </Link>
      </div>

      <div className="mt-12 text-xs text-text-muted">
        Se o problema persistir, entre em contato com o suporte técnico informando o erro: 
        <code className="ml-1 bg-surface px-2 py-1 rounded border border-border-subtle">{error.digest || 'admin-root-error'}</code>
      </div>
    </div>
  );
}
