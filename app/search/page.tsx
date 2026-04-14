'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { UserService } from '@/services/user-service';
import { UserProfile } from '@/models/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MapPin, 
  Star, 
  ArrowLeft, 
  Filter, 
  Briefcase, 
  ShieldCheck,
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { CepFilter } from '@/components/cep-filter';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const city = searchParams.get('city') || '';
  const state = searchParams.get('state') || '';

  const [searchTerm, setSearchTerm] = useState(query);
  const [results, setResults] = useState<UserProfile[]>([]);
  const [suggestions, setSuggestions] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const location = city && state ? { city, state } : undefined;
        const data = await UserService.searchProviders(query, location);
        setResults(data);

        // If no results, fetch suggestions from the same location
        if (data.length === 0 && location) {
          const suggestedData = await UserService.searchProviders('', location);
          setSuggestions(suggestedData.slice(0, 3));
        } else if (data.length === 0) {
          // If no location, fetch any featured providers
          const featured = await UserService.getProviders(3);
          setSuggestions(featured);
        }
      } catch (error) {
        console.error('Error searching:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query, city, state]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    params.set('q', searchTerm);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header / Search Bar */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 md:px-8 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-4 md:gap-8">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 hidden sm:block">Skillsy</h1>
          </Link>

          <form onSubmit={handleSearch} className="flex-grow w-full max-w-3xl flex items-center gap-2 bg-slate-100 rounded-full px-4 py-1 border border-transparent focus-within:border-primary/30 focus-within:bg-white focus-within:shadow-md transition-all">
            <Search className="text-slate-400 shrink-0" size={20} />
            <Input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar serviços ou profissionais..."
              className="border-none bg-transparent focus-visible:ring-0 text-slate-700 h-10"
            />
            <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block" />
            <div className="hidden sm:block">
               <CepFilter onLocationChange={(loc) => {
                 if (loc) {
                   const params = new URLSearchParams(searchParams.toString());
                   params.set('city', loc.city);
                   params.set('state', loc.state);
                   router.push(`/search?${params.toString()}`);
                 }
               }} />
            </div>
            <Button type="submit" size="sm" className="rounded-full bg-primary hover:bg-primary/90 text-white px-6 hidden sm:flex">
              Buscar
            </Button>
          </form>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar / Filters */}
          <aside className="w-full lg:w-64 shrink-0 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-primary" /> Filtros
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Categorias</p>
                  <div className="space-y-2">
                    {['Tecnologia', 'Manutenção', 'Saúde', 'Educação', 'Eventos'].map(cat => (
                      <label key={cat} className="flex items-center gap-2 text-sm text-slate-600 hover:text-primary cursor-pointer">
                        <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary" />
                        {cat}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Results List */}
          <div className="flex-grow space-y-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">
                {loading ? 'Buscando...' : `Aproximadamente ${results.length} resultados encontrados`}
              </p>
            </div>

            <AnimatePresence mode="popLayout">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-48 bg-slate-200 animate-pulse rounded-3xl" />
                  ))}
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-4">
                  {results.map((p, idx) => (
                    <motion.div
                      key={p.uid}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Link href={`/profile/${p.uid}`}>
                        <Card className="group flex flex-col md:flex-row gap-6 p-6 rounded-[2rem] border-slate-200 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all bg-white cursor-pointer relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[4rem] -mr-16 -mt-16 transition-all group-hover:bg-primary/5" />
                          
                          <div className="shrink-0 flex flex-col items-center gap-3">
                            <Avatar className="w-24 h-24 border-4 border-slate-50 shadow-sm">
                              <AvatarImage src={p.photoURL} />
                              <AvatarFallback className="bg-primary/10 text-primary font-bold text-3xl">{p.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex items-center gap-1 text-highlight font-bold text-sm">
                              <Star size={14} fill="currentColor" /> {p.rating || '0.0'}
                            </div>
                          </div>

                          <div className="flex-grow space-y-3">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">
                                    {p.name}
                                  </CardTitle>
                                  {p.verifiedMember && <ShieldCheck size={18} className="text-primary" />}
                                </div>
                                <p className="text-sm font-semibold text-primary mt-0.5">
                                  {p.serviceType || p.category || 'Profissional'}
                                </p>
                              </div>
                              <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-500 rounded-full px-3">
                                <MapPin size={12} className="mr-1" /> {p.location || 'Brasil'}
                              </Badge>
                            </div>

                            <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 max-w-2xl">
                              {p.bio || 'Este membro da comunidade oferece serviços de alta qualidade com valores compartilhados. Clique para ver mais detalhes e entrar em contato.'}
                            </p>

                            <div className="flex flex-wrap gap-2 pt-2">
                              <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-none rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                {p.experienceYears || 0} anos de exp.
                              </Badge>
                              <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-none rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                Atendimento Local
                              </Badge>
                            </div>
                          </div>

                          <div className="flex items-center justify-center md:border-l border-slate-100 md:pl-6">
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                              <ChevronRight size={20} />
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-12">
                  <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                    <Briefcase className="mx-auto h-16 w-16 text-slate-200 mb-6" />
                    <h4 className="text-2xl font-bold text-slate-900 mb-2">Nenhum resultado exato encontrado</h4>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto">
                      Não encontramos profissionais para &quot;{query}&quot;{city ? ` em ${city}` : ''}. 
                      Tente termos mais genéricos ou veja as sugestões abaixo.
                    </p>
                    <Button onClick={() => {
                      setSearchTerm('');
                      const params = new URLSearchParams(searchParams.toString());
                      params.delete('q');
                      router.push(`/search?${params.toString()}`);
                    }} variant="outline" className="rounded-xl px-8">
                      Limpar Filtro de Busca
                    </Button>
                  </div>

                  {suggestions.length > 0 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-px flex-grow bg-slate-200" />
                        <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest shrink-0">
                          {city ? `Membros em ${city}` : 'Membros em Destaque'}
                        </h3>
                        <div className="h-px flex-grow bg-slate-200" />
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {suggestions.map((p) => (
                          <Link href={`/profile/${p.uid}`} key={p.uid}>
                            <Card className="group p-6 rounded-[2rem] border-slate-200 hover:border-primary/20 hover:shadow-lg transition-all bg-white cursor-pointer flex items-center gap-6">
                              <Avatar className="w-16 h-16 border-2 border-slate-50">
                                <AvatarImage src={p.photoURL} />
                                <AvatarFallback className="bg-primary/5 text-primary font-bold">{p.name[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-grow">
                                <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{p.name}</h4>
                                <p className="text-sm text-primary font-medium">{p.serviceType || p.category}</p>
                                <div className="flex items-center gap-3 mt-1">
                                  <div className="flex items-center gap-1 text-highlight font-bold text-xs">
                                    <Star size={12} fill="currentColor" /> {p.rating || '0.0'}
                                  </div>
                                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <MapPin size={10} /> {p.location}
                                  </div>
                                </div>
                              </div>
                              <ChevronRight size={20} className="text-slate-300 group-hover:text-primary transition-all" />
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
