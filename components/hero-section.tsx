'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CepFilter } from '@/components/cep-filter';

interface HeroSectionProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  searching: boolean;
  locationFilter: { city: string; state: string } | null;
  setLocationFilter: (loc: { city: string; state: string } | null) => void;
}

export function HeroSection({
  searchTerm,
  setSearchTerm,
  handleSearch,
  searching,
  locationFilter,
  setLocationFilter
}: HeroSectionProps) {
  return (
    <section className="relative pt-32 pb-24 px-6 md:px-10 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,var(--color-surface)_0%,white_100%)]" />
      <div className="max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full mb-10 border border-primary/20 backdrop-blur-sm"
        >
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Comunidade Ativa</span>
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl md:text-8xl font-black tracking-tighter text-text-main mb-8 leading-[0.85] uppercase"
        >
          Talento <br /> <span className="text-primary">Comunitário.</span>
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl text-text-muted mb-16 max-w-2xl mx-auto leading-relaxed font-medium"
        >
          Conectando profissionais da comunidade SUD em uma rede <span className="text-primary font-bold">100% gratuita</span>. 
          Apoio mútuo e excelência em cada serviço prestado.
        </motion.p>

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSearch}
          className="flex flex-col md:flex-row gap-3 max-w-3xl mx-auto bg-card p-2 rounded-3xl md:rounded-full shadow-2xl shadow-primary/10 border border-border-subtle ring-1 ring-black/[0.02] mb-6"
        >
          <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted/50" size={20} />
            <Input 
              placeholder="O que você procura hoje?" 
              className="pl-14 border-none bg-transparent focus-visible:ring-0 text-lg h-14 font-semibold placeholder:text-text-muted/30"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button type="submit" className="bg-primary text-white h-14 px-10 rounded-2xl md:rounded-full hover:bg-primary/90 transition-all font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95">
            {searching ? 'Buscando...' : 'Buscar'}
          </Button>
        </motion.form>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center gap-4"
        >
          <CepFilter onLocationChange={setLocationFilter} />
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
            Localização atual: <span className="text-primary">{locationFilter ? `${locationFilter.city}, ${locationFilter.state}` : 'Todo o Brasil'}</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
