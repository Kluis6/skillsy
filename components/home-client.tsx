'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useSearchController } from '@/hooks/use-search-controller';
import { useContactsController } from '@/hooks/use-contacts-controller';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, User as UserIcon, Briefcase, MapPin, Star, UserPlus, UserMinus, Users, ShieldCheck, Menu, Settings, LogOut, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthModal } from '@/components/auth-modal';
import { CepFilter } from '@/components/cep-filter';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { ThemeToggle } from '@/components/theme-toggle';

export function HomeClient() {
  const router = useRouter();
  const { user, profile, logout, loading, toggleContact } = useAuth();
  const [activeTab, setActiveTab] = useState<'explore' | 'contacts'>('explore');

  // Controllers
  const {
    searchTerm,
    setSearchTerm,
    locationFilter,
    setLocationFilter,
    providers,
    searching
  } = useSearchController();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (locationFilter) {
      params.set('city', locationFilter.city);
      params.set('state', locationFilter.state);
    }
    router.push(`/search?${params.toString()}`);
  };

  const { savedContacts } = useContactsController(profile, activeTab);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <Skeleton className="h-10 w-32 rounded-xl" />
            <div className="flex gap-4">
              <Skeleton className="h-10 w-24 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
          <div className="max-w-3xl mx-auto text-center mb-20">
            <Skeleton className="h-4 w-32 mx-auto mb-6 rounded-full" />
            <Skeleton className="h-16 w-full mb-6 rounded-2xl" />
            <Skeleton className="h-16 w-3/4 mx-auto mb-10 rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[400px] w-full rounded-[2.5rem]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans text-text-main">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border-subtle px-6 md:px-10 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon" className="text-text-main hover:bg-surface rounded-full transition-all duration-300">
                    <Menu size={24} />
                  </Button>
                }
              />
              <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-background p-0 border-r border-border-subtle">
                <div className="flex flex-col h-full">
                  <SheetHeader className="p-8 text-left bg-surface/30">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">S</span>
                      </div>
                      <SheetTitle className="text-2xl font-bold text-text-main">Skillsy</SheetTitle>
                    </div>
                    <SheetDescription className="text-text-muted font-medium">
                      Sua rede de confiança e talentos.
                    </SheetDescription>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto py-6">
                    {user ? (
                      <div className="px-6 mb-8">
                        <div className="flex items-center gap-4 p-4 bg-surface rounded-2xl border border-primary/5">
                          <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                            <AvatarImage src={user.photoURL || ''} />
                            <AvatarFallback className="bg-primary text-white font-bold">{profile?.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-bold text-text-main">{profile?.name}</span>
                            <span className="text-xs text-text-muted">{user.email}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="px-6 mb-8">
                        <AuthModal>
                          <Button className="w-full bg-primary text-white font-bold h-12 rounded-xl shadow-lg shadow-primary/10">
                            Entrar na Conta
                          </Button>
                        </AuthModal>
                      </div>
                    )}

                    <div className="px-4 space-y-1">
                      <h4 className="px-4 text-[10px] font-bold uppercase tracking-widest text-text-muted/60 mb-2">Navegação</h4>
                      <Button 
                        variant="ghost" 
                        className={`w-full justify-start gap-3 h-12 rounded-xl font-semibold ${activeTab === 'explore' ? 'bg-surface text-primary' : 'text-text-muted hover:text-primary hover:bg-surface/50'}`}
                        onClick={() => setActiveTab('explore')}
                      >
                        <Search size={18} /> Explorar Membros
                      </Button>
                      
                      {user && (
                        <Link href="/contacts">
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start gap-3 h-12 rounded-xl font-semibold text-text-muted hover:text-primary hover:bg-surface/50"
                          >
                            <Users size={18} /> Meus Contatos
                          </Button>
                        </Link>
                      )}
                    </div>

                    <Separator className="my-6 mx-8 w-auto bg-border-subtle/50" />

                    <div className="px-4 space-y-1">
                      <h4 className="px-4 text-[10px] font-bold uppercase tracking-widest text-text-muted/60 mb-2">Conta</h4>
                      {profile?.role === 'admin' && (
                        <Link href="/admin">
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start gap-3 h-12 rounded-xl font-bold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/10 mb-2"
                          >
                            <ShieldCheck size={18} /> Painel Admin
                          </Button>
                        </Link>
                      )}
                      <Link href="/profile">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start gap-3 h-12 rounded-xl font-semibold text-text-muted hover:text-primary hover:bg-surface/50"
                        >
                          <Settings size={18} /> Configurações do Perfil
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start gap-3 h-12 rounded-xl font-semibold text-text-muted hover:text-primary hover:bg-surface/50"
                        onClick={() => toast.info('Funcionalidade de Doação', {
                          description: 'Esta plataforma é sem fins lucrativos. Em breve você poderá apoiar a manutenção do projeto.'
                        })}
                      >
                        <Heart size={18} className="text-red-500" /> Doar para o Projeto
                      </Button>
                    </div>
                  </div>

                  {user && (
                    <div className="p-6 border-t border-border-subtle bg-surface/10">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start gap-3 h-12 rounded-xl font-bold text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={logout}
                      >
                        <LogOut size={18} /> Sair da Conta
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-text-main">
                Skillsy
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4 md:gap-8">
            <ul className="hidden md:flex items-center gap-8 text-sm font-semibold text-text-muted">
              <li 
                onClick={() => setActiveTab('explore')}
                className={`cursor-pointer transition-all ${activeTab === 'explore' ? 'text-primary' : 'hover:text-primary'}`}
              >
                Explorar
              </li>
              {user && (
                <li 
                  onClick={() => setActiveTab('contacts')}
                  className={`cursor-pointer transition-all ${activeTab === 'contacts' ? 'text-primary' : 'hover:text-primary'}`}
                >
                  Contatos
                </li>
              )}
            </ul>

            <ThemeToggle />

            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-bold text-text-main">{profile?.name}</span>
                  {profile?.role === 'admin' && <span className="text-[10px] text-accent font-bold uppercase">Admin</span>}
                </div>
                <Avatar className="w-9 h-9 border border-border-subtle">
                  <AvatarImage src={user.photoURL || ''} />
                  <AvatarFallback><UserIcon size={18} /></AvatarFallback>
                </Avatar>
                <Button variant="ghost" size="sm" onClick={logout} className="text-text-muted hover:text-primary font-bold">
                  Sair
                </Button>
              </div>
            ) : (
              <AuthModal>
                <Button className="bg-primary text-white hover:bg-primary/90 rounded-full px-6 font-bold shadow-lg shadow-primary/20">
                  Entrar
                </Button>
              </AuthModal>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
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
            className="flex flex-col md:flex-row gap-3 max-w-3xl mx-auto bg-card p-2 rounded-3xl md:rounded-full shadow-2xl shadow-primary/10 border border-border-subtle ring-1 ring-black/[0.02]"
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
            <div className="h-10 w-px bg-border-subtle hidden md:block self-center opacity-50" />
            <CepFilter onLocationChange={setLocationFilter} />
            <Button type="submit" className="bg-primary text-white h-14 px-10 rounded-2xl md:rounded-full hover:bg-primary/90 transition-all font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95">
              {searching ? 'Buscando...' : 'Buscar'}
            </Button>
          </motion.form>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 md:px-10 pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'explore' ? (
            <motion.div
              key="explore"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-16">
                <h3 className="text-3xl font-bold text-text-main mb-4">Membros em Destaque</h3>
                <p className="text-text-muted">Conheça os profissionais mais bem avaliados da nossa rede.</p>
              </div>

              {providers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {providers.map((p, idx) => (
                    <motion.div
                      key={p.uid}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="group h-full flex flex-col hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 border-border-subtle bg-card rounded-3xl p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-surface rounded-bl-full -mr-12 -mt-12 transition-all group-hover:bg-primary/10" />
                               {p.uid !== user?.uid && (
                          <Tooltip>
                            <TooltipTrigger>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="absolute top-4 right-4 text-text-muted hover:text-primary hover:bg-primary/5 rounded-full z-10 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!user) {
                                    toast.error('Login necessário', {
                                      description: 'Você precisa estar logado para adicionar contatos.'
                                    });
                                    return;
                                  }
                                  toggleContact(p.uid);
                                }}
                              >
                                {profile?.contacts?.includes(p.uid) ? <UserMinus size={20} /> : <UserPlus size={20} />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-text-main text-white border-none rounded-lg text-[10px] font-bold uppercase tracking-widest">
                              {profile?.contacts?.includes(p.uid) ? 'Remover Contato' : 'Adicionar Contato'}
                            </TooltipContent>
                          </Tooltip>
                        )}
                        
                        <div className="mb-6">
                          <Badge className="bg-surface text-primary border-none font-bold text-[10px] uppercase px-3 py-1 rounded-full">
                            {p.category || 'Geral'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 mb-6">
                          <Avatar className="w-14 h-14 border-2 border-surface">
                            <AvatarImage src={p.photoURL} />
                            <AvatarFallback className="bg-surface text-primary font-bold text-xl">{p.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-xl font-bold text-text-main">{p.name}</CardTitle>
                            <div className="flex items-center gap-1 text-xs text-text-muted mt-1">
                              <MapPin size={12} /> {p.location || 'Brasil'}
                            </div>
                          </div>
                        </div>

                        <CardContent className="p-0 flex-grow mb-8">
                          <p className="text-text-muted text-sm leading-relaxed line-clamp-3">
                            {p.bio || 'Membro dedicado da comunidade oferecendo serviços com excelência e valores compartilhados.'}
                          </p>
                        </CardContent>

                        <div className="pt-6 border-t border-border-subtle flex justify-between items-center">
                          <div className="flex items-center gap-1 text-sm font-bold text-highlight">
                            <Star size={16} fill="currentColor" /> {p.rating || '0.0'}
                          </div>
                          <Link href={`/profile/${p.uid}`}>
                            <Button variant="link" className="text-primary font-bold p-0 h-auto">Ver Detalhes</Button>
                          </Link>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-surface/30 rounded-3xl border-2 border-dashed border-border-subtle">
                  <Briefcase className="mx-auto h-12 w-12 text-text-muted/20 mb-4" />
                  <h4 className="text-xl font-bold text-text-main">Nenhum resultado</h4>
                  <p className="text-sm text-text-muted">Tente ajustar seus filtros de busca.</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="contacts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-16">
                <h3 className="text-3xl font-bold text-text-main mb-4">Seus Contatos</h3>
                <p className="text-text-muted">Mantenha sua rede de confiança sempre por perto.</p>
              </div>

              {savedContacts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {savedContacts.map((p, idx) => (
                    <motion.div
                      key={p.uid}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="group h-full flex flex-col hover:shadow-2xl transition-all duration-300 border-border-subtle bg-card rounded-3xl p-8 relative">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute top-4 right-4 text-primary hover:bg-primary/5 rounded-full"
                          onClick={() => toggleContact(p.uid)}
                        >
                          <UserMinus size={20} />
                        </Button>
                        
                        <div className="flex items-center gap-4 mb-6">
                          <Avatar className="w-16 h-16 border-2 border-surface">
                            <AvatarImage src={p.photoURL} />
                            <AvatarFallback className="bg-surface text-primary font-bold text-2xl">{p.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-xl font-bold text-text-main">{p.name}</CardTitle>
                            <Badge variant="outline" className="mt-1 border-primary/20 text-primary text-[10px] font-bold uppercase">{p.category || 'Membro'}</Badge>
                          </div>
                        </div>

                        <CardContent className="p-0 flex-grow mb-8">
                          <p className="text-text-muted text-sm leading-relaxed line-clamp-2">
                            {p.bio || 'Sem descrição disponível.'}
                          </p>
                        </CardContent>

                        <div className="pt-6 border-t border-border-subtle flex gap-3">
                          <Link href={`/profile/${p.uid}`} className="flex-1">
                            <Button className="w-full bg-primary text-white hover:bg-primary/90 rounded-2xl h-11 text-sm font-bold">
                              Ver Perfil
                            </Button>
                          </Link>
                          <Button variant="outline" className="flex-1 border-border-subtle hover:bg-surface rounded-2xl h-11 text-sm font-bold">
                            Mensagem
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-surface/30 rounded-3xl border-2 border-dashed border-border-subtle">
                  <Users className="mx-auto h-12 w-12 text-text-muted/20 mb-4" />
                  <h4 className="text-xl font-bold text-text-main">Lista vazia</h4>
                  <p className="text-sm text-text-muted mb-8">Você ainda não salvou nenhum contato.</p>
                  <Button 
                    className="rounded-full bg-primary text-white font-bold px-8"
                    onClick={() => setActiveTab('explore')}
                  >
                    Explorar Agora
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA Section - Blue Background like the image */}
        <section className="mt-24 bg-primary rounded-[2.5rem] p-12 md:p-20 text-white relative overflow-hidden shadow-2xl shadow-primary/30">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full -ml-32 -mb-32 blur-3xl" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-xl text-center md:text-left">
              <h3 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">Dúvidas ou Sugestões?</h3>
              <p className="text-white/80 text-lg mb-8">
                Estamos aqui para ajudar você a encontrar o melhor serviço ou a divulgar o seu talento. 
                Faça parte da nossa rede de excelência.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
                  <ShieldCheck size={18} className="text-accent" />
                  <span className="text-sm font-bold">Seguro & Confiável</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
                  <Star size={18} className="text-highlight" />
                  <span className="text-sm font-bold">Qualidade SUD</span>
                </div>
              </div>
            </div>
            
            <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl">
              <h4 className="text-text-main text-xl font-bold mb-6 text-center">Fale Conosco</h4>
              <div className="space-y-4">
                <Input placeholder="Seu Nome" className="bg-surface border-none h-12 rounded-xl text-text-main placeholder:text-text-muted/50" />
                <Input placeholder="Seu Email" className="bg-surface border-none h-12 rounded-xl text-text-main placeholder:text-text-muted/50" />
                <textarea 
                  placeholder="Sua Mensagem" 
                  className="w-full bg-surface border-none rounded-xl p-4 text-text-main placeholder:text-text-muted/50 h-32 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
                <Button className="w-full bg-primary text-white h-12 rounded-xl font-bold hover:bg-primary/90 shadow-lg shadow-primary/20">
                  Enviar Mensagem
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-16 text-center text-sm text-text-muted">
          Possui uma empresa ou presta serviços? {' '}
          {user ? (
            !profile?.isProvider && (
              <strong className="text-accent cursor-pointer hover:underline">Cadastre sua Skill agora</strong>
            )
          ) : (
            <AuthModal>
              <button className="text-accent font-bold cursor-pointer hover:underline bg-transparent border-none p-0">
                Cadastre sua Skill agora
              </button>
            </AuthModal>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border-subtle py-12 px-6 md:px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-text-main tracking-tight">Skillsy</span>
          </div>
          <p className="text-text-muted text-center md:text-left">
            © 2026 Skillsy. Criado para fortalecer a comunidade SUD. <br className="md:hidden" />
            <span className="text-primary font-bold">Plataforma 100% sem fins lucrativos.</span>
          </p>
          <div className="flex gap-6 text-text-muted">
            <a href="#" className="hover:text-primary transition-colors">Termos</a>
            <a href="#" className="hover:text-primary transition-colors">Privacidade</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
