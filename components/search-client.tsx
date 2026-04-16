'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
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
  ShieldCheck,
  ChevronRight,
  SlidersHorizontal,
  UserPlus,
  UserMinus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { CepFilter } from '@/components/cep-filter';
import { toast } from 'sonner';

import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { ThemeToggle } from '@/components/theme-toggle';

function SearchResultsContent() {
  const { profile, toggleContact } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const city = searchParams.get('city') || '';
  const state = searchParams.get('state') || '';

  const [searchTerm, setSearchTerm] = useState(query);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [results, setResults] = useState<UserProfile[]>([]);
  const [suggestions, setSuggestions] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const location = city && state ? { city, state } : undefined;
        let data = await UserService.searchProviders(query, location);
        
        if (selectedCategories.length > 0) {
          data = data.filter(p => 
            selectedCategories.some(cat => 
              p.category === cat || p.serviceType?.toLowerCase().includes(cat.toLowerCase())
            )
          );
        }

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
  }, [query, city, state, selectedCategories]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    params.set('q', searchTerm);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-surface/30">
      {/* Header / Search Bar */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border-subtle px-4 md:px-8 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-4 md:gap-8">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <h1 className="text-xl font-black text-text-main hidden sm:block tracking-tighter uppercase">Skillsy</h1>
          </Link>

          <form onSubmit={handleSearch} className="flex-grow w-full max-w-3xl flex items-center gap-2 bg-surface rounded-2xl px-4 py-1 border border-transparent focus-within:border-primary/20 focus-within:bg-card focus-within:shadow-xl focus-within:shadow-primary/5 transition-all duration-300">
            <Search className="text-text-muted/40 shrink-0" size={20} />
            <Input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="O que você procura hoje?"
              className="border-none bg-transparent focus-visible:ring-0 text-text-main h-12 font-semibold placeholder:text-text-muted/30"
            />
            <Button type="submit" size="sm" className="rounded-xl bg-primary hover:bg-primary/90 text-white px-8 h-10 font-bold hidden sm:flex shadow-lg shadow-primary/10 active:scale-95 transition-all">
              Buscar
            </Button>
          </form>
          <ThemeToggle />
        </div>
      </header>

      <div className="bg-card border-b border-border-subtle py-4 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <CepFilter onLocationChange={(loc) => {
              const params = new URLSearchParams(searchParams.toString());
              if (loc) {
                params.set('city', loc.city);
                params.set('state', loc.state);
              } else {
                params.delete('city');
                params.delete('state');
              }
              router.push(`/search?${params.toString()}`);
            }} />
          </div>
          <div className="hidden md:block">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
              Filtrando por: <span className="text-primary">{city && state ? `${city}, ${state}` : 'Todo o Brasil'}</span>
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar / Filters */}
          <aside className="w-full lg:w-72 shrink-0 space-y-8">
            <div className="bg-card rounded-[2.5rem] p-8 border border-border-subtle shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-text-main flex items-center gap-2 font-heading">
                  <SlidersHorizontal size={18} className="text-primary" /> Filtros
                </h3>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-4">Categorias</p>
                  <div className="space-y-3">
                    {[
                      'Tecnologia', 'Design', 'Marketing', 'Consultoria', 'Cozinha', 
                      'Limpeza', 'Manutenção', 'Beleza', 'Educação', 'Saúde', 
                      'Eventos', 'Jurídico', 'Financeiro', 'Assistência', 'Reformas', 
                      'Automotivo', 'Moda', 'Bem Estar', 'Pet Care', 'Fotografia', 
                      'Música', 'Idiomas', 'Esportes', 'Festas', 'Transporte'
                    ].map(cat => (
                      <label key={cat} className="flex items-center gap-3 text-sm font-medium text-text-muted hover:text-primary cursor-pointer transition-colors group">
                        <div className={`w-5 h-5 rounded-lg border-2 transition-all flex items-center justify-center ${
                          selectedCategories.includes(cat) ? 'border-primary bg-primary/5' : 'border-border-subtle group-hover:border-primary/30'
                        }`}>
                          <input 
                            type="checkbox" 
                            className="hidden" 
                            checked={selectedCategories.includes(cat)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCategories(prev => [...prev, cat]);
                              } else {
                                setSelectedCategories(prev => prev.filter(c => c !== cat));
                              }
                            }}
                          />
                          <div className={`w-2.5 h-2.5 bg-primary rounded-sm transition-opacity ${
                            selectedCategories.includes(cat) ? 'opacity-100' : 'opacity-0 group-hover:opacity-10'
                          }`} />
                        </div>
                        {cat}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Results List */}
          <div className="flex-grow space-y-8">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-text-muted uppercase tracking-widest">
                {loading ? 'Buscando membros...' : `${results.length} resultados encontrados`}
              </p>
            </div>

            <AnimatePresence mode="popLayout">
              {loading ? (
                <div className="space-y-6">
                  {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-48 w-full rounded-[2.5rem]" />
                  ))}
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-6">
                  {results.map((p, idx) => (
                    <motion.div
                      key={p.uid}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Link href={`/profile/${p.uid}`}>
                        <Card className="group flex flex-col md:flex-row gap-6 p-8 rounded-[2.5rem] border-border-subtle hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 bg-card cursor-pointer relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-surface rounded-bl-[4rem] -mr-16 -mt-16 transition-all group-hover:bg-primary/5" />
                          
                          <div className="shrink-0 flex flex-col items-center gap-4">
                            <Avatar className="w-24 h-24 border-4 border-surface shadow-sm">
                              <AvatarImage src={p.photoURL} />
                              <AvatarFallback className="bg-primary/10 text-primary font-bold text-3xl">{p.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex items-center gap-1 text-highlight font-bold text-sm">
                              <Star size={16} fill="currentColor" /> {p.rating || '0.0'}
                            </div>
                          </div>

                          <div className="flex-grow space-y-4">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2">
                                  <CardTitle className="text-2xl font-bold text-text-main group-hover:text-primary transition-colors font-heading">
                                    {p.name}
                                  </CardTitle>
                                  {p.verifiedMember && <ShieldCheck size={20} className="text-primary" />}
                                </div>
                                <p className="text-sm font-bold text-primary mt-1 uppercase tracking-wider flex items-center gap-2">
                                  {p.companyName && <span className="text-text-main/60 normal-case font-medium">{p.companyName} • </span>}
                                  {p.serviceType || p.category || 'Profissional'}
                                </p>
                              </div>
                              <Badge variant="outline" className="bg-surface border-border-subtle text-text-muted rounded-full px-4 py-1 font-bold text-[10px] uppercase tracking-widest">
                                <MapPin size={12} className="mr-2" /> {p.location || 'Brasil'}
                              </Badge>
                            </div>

                            <p className="text-text-muted text-sm leading-relaxed line-clamp-2 max-w-2xl">
                              {p.bio || 'Este membro da comunidade oferece serviços de alta qualidade com valores compartilhados. Clique para ver mais detalhes e entrar em contato.'}
                            </p>

                            <div className="flex flex-wrap gap-3 pt-2">
                              <Badge className="bg-surface text-text-muted hover:bg-primary/5 hover:text-primary border-none rounded-xl px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors">
                                Atendimento Local
                              </Badge>
                              <div className="flex-grow" />
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 rounded-lg text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleContact(p.uid);
                                  toast.success('Lista de contatos atualizada');
                                }}
                              >
                                {profile?.contacts?.includes(p.uid) ? (
                                  <><UserMinus size={14} className="mr-1.5" /> Remover</>
                                ) : (
                                  <><UserPlus size={14} className="mr-1.5" /> Adicionar</>
                                )}
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-center justify-center md:border-l border-border-subtle md:pl-8">
                            <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center text-text-muted group-hover:bg-primary group-hover:text-white group-hover:rotate-45 transition-all duration-500">
                              <ChevronRight size={24} />
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-12">
                  <div className="text-center py-20 bg-card rounded-[3rem] border-2 border-dashed border-slate-200">
                    <Search className="mx-auto h-16 w-16 text-slate-200 mb-6" />
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
                            <Card className="group p-6 rounded-[2rem] border-slate-200 hover:border-primary/20 hover:shadow-lg transition-all bg-card cursor-pointer flex items-center gap-6">
                              <Avatar className="w-16 h-16 border-2 border-slate-50">
                                <AvatarImage src={p.photoURL} />
                                <AvatarFallback className="bg-primary/5 text-primary font-bold">{p.name[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-grow">
                                <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{p.name}</h4>
                                <p className="text-sm text-primary font-medium">
                                  {p.companyName && <span className="text-slate-500 font-normal">{p.companyName} • </span>}
                                  {p.serviceType || p.category}
                                </p>
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

export function SearchClient() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
