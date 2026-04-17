import { Button } from '@/components/ui/button';
import { SearchSlash, Home } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-surface text-center">
      <div className="w-24 h-24 bg-primary/5 text-primary rounded-[2rem] flex items-center justify-center mb-8 rotate-3">
        <SearchSlash size={48} />
      </div>
      
      <h1 className="text-4xl font-bold text-text-main mb-4 font-heading tracking-tight">Página não encontrada</h1>
      <p className="text-text-muted max-w-sm mb-12 leading-relaxed text-lg">
        Parece que o link que você seguiu expirou ou a página foi removida da plataforma.
      </p>

      <Link href="/">
        <Button 
          className="bg-primary text-white hover:bg-primary/90 rounded-[1.5rem] px-10 h-14 text-lg font-bold shadow-xl shadow-primary/20 group"
        >
          <Home size={22} className="mr-3 group-hover:-translate-y-0.5 transition-transform" /> 
          Ir para Página Inicial
        </Button>
      </Link>
      
      <div className="mt-16 flex gap-8">
        <div className="flex flex-col items-center opacity-50">
          <span className="text-3xl font-bold font-heading">404</span>
          <span className="text-[10px] uppercase tracking-widest font-bold">Error Code</span>
        </div>
      </div>
    </div>
  );
}
