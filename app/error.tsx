'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-surface text-center">
      <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mb-6">
        <AlertCircle size={40} />
      </div>
      
      <h1 className="text-3xl font-bold text-text-main mb-4 font-heading">Ops! Algo deu errado</h1>
      <p className="text-text-muted max-w-md mb-10 leading-relaxed">
        Ocorreu um erro inesperado na aplicação. Nossa equipe técnica já foi notificada.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={() => reset()}
          className="bg-primary text-white hover:bg-primary/90 rounded-2xl px-8 h-12 font-bold shadow-lg shadow-primary/20"
        >
          <RotateCcw size={18} className="mr-2" /> Tentar Novamente
        </Button>
        
        <Link href="/">
          <Button 
            variant="outline"
            className="rounded-2xl px-8 h-12 font-bold border-border-subtle hover:bg-surface"
          >
            <Home size={18} className="mr-2" /> Voltar para Home
          </Button>
        </Link>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <div className="mt-12 p-6 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-3xl text-left max-w-2xl w-full overflow-hidden">
          <p className="text-xs font-mono text-red-500 break-words">
            {error.message || 'Erro desconhecido'}
          </p>
          {error.stack && (
            <pre className="mt-4 text-[10px] font-mono text-red-400 overflow-x-auto">
              {error.stack}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
