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
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { HeroSection } from '@/components/hero-section';
import { ContactCTA } from '@/components/contact-cta';
import { CategoryCarousel } from '@/components/category-carousel';
import { AuthModal } from '@/components/auth-modal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

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
      <Navbar 
        user={user} 
        profile={profile} 
        logout={logout} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      <HeroSection 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleSearch={handleSearch}
        searching={searching}
        locationFilter={locationFilter}
        setLocationFilter={setLocationFilter}
      />

      {/* Categories Carousel */}
      <CategoryCarousel />

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
                            {p.companyName && (
                              <p className="text-[10px] font-bold text-primary uppercase tracking-wider mt-0.5">
                                {p.companyName}
                              </p>
                            )}
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
                            {p.companyName && (
                              <p className="text-[10px] font-bold text-primary uppercase tracking-wider mt-0.5">
                                {p.companyName}
                              </p>
                            )}
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

        {/* CTA Section */}
        <ContactCTA />

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

      <Footer />
    </div>
  );
}
