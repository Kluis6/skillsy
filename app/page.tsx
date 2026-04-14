'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, where, limit } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, LogIn, User as UserIcon, Briefcase, MapPin, MessageSquare, Star, UserPlus, UserMinus, Users, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthModal } from '@/components/auth-modal';

export default function Home() {
  const { user, profile, logout, loading, toggleContact } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [providers, setProviders] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'explore' | 'contacts'>('explore');
  const [savedContacts, setSavedContacts] = useState<any[]>([]);

  const fetchInitialProviders = useCallback(async () => {
    try {
      const q = query(collection(db, 'users'), where('isProvider', '==', true), limit(6));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProviders(data);
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  }, []);

  const fetchSavedContacts = useCallback(async () => {
    if (!profile?.contacts || profile.contacts.length === 0) {
      setSavedContacts([]);
      return;
    }

    try {
      // Firestore 'in' query is limited to 10 items, but for a simple contact list it's fine for now
      const q = query(collection(db, 'users'), where('uid', 'in', profile.contacts.slice(0, 10)));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSavedContacts(data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  }, [profile?.contacts]);

  useEffect(() => {
    fetchInitialProviders();
  }, [fetchInitialProviders]);

  useEffect(() => {
    if (activeTab === 'contacts' && profile?.contacts?.length > 0) {
      fetchSavedContacts();
    }
  }, [activeTab, profile?.contacts, fetchSavedContacts]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setSearching(true);
    try {
      const q = query(collection(db, 'users'), where('isProvider', '==', true));
      const querySnapshot = await getDocs(q);
      const allProviders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const filtered = allProviders.filter((p: any) => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.bio?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      setProviders(filtered);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setSearching(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-pulse text-text-muted font-medium text-lg">Skillsy</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans text-text-main">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border-subtle px-10 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-1">
            <h1 className="text-2xl font-extrabold tracking-tighter text-primary">
              SKILLS<span className="text-accent">Y</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-8">
            <ul className="hidden md:flex items-center gap-6 text-sm font-medium text-text-muted">
              <li 
                onClick={() => setActiveTab('explore')}
                className={`cursor-pointer pb-1 transition-all ${activeTab === 'explore' ? 'text-primary border-b-2 border-accent' : 'hover:text-primary'}`}
              >
                Explorar
              </li>
              {user && (
                <li 
                  onClick={() => setActiveTab('contacts')}
                  className={`cursor-pointer pb-1 transition-all ${activeTab === 'contacts' ? 'text-primary border-b-2 border-accent' : 'hover:text-primary'}`}
                >
                  Meus Contatos
                </li>
              )}
              {profile?.role === 'admin' && (
                <li className="flex items-center gap-1 text-accent font-bold hover:opacity-80 cursor-pointer">
                  <ShieldCheck size={16} /> Painel Admin
                </li>
              )}
            </ul>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end mr-2">
                  <span className="text-xs font-bold text-primary">{profile?.name}</span>
                  {profile?.role === 'admin' && <span className="text-[10px] text-accent font-bold uppercase tracking-tighter">Administrador</span>}
                </div>
                <Avatar className="w-9 h-9 border border-border-subtle">
                  <AvatarImage src={user.photoURL || ''} />
                  <AvatarFallback><UserIcon size={18} /></AvatarFallback>
                </Avatar>
                <Button variant="ghost" size="sm" onClick={logout} className="text-text-muted hover:text-primary">
                  Sair
                </Button>
              </div>
            ) : (
              <AuthModal>
                <Button className="bg-primary text-white hover:bg-primary/90 rounded-full px-6 font-semibold">
                  Entrar
                </Button>
              </AuthModal>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold tracking-tight text-primary mb-4"
          >
            Fortaleça nossa comunidade.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-text-muted mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Conectando membros que oferecem serviços e negócios com excelência e valores compartilhados.
          </motion.p>

          <motion.form 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row gap-3 max-w-2xl mx-auto bg-white p-2 rounded-full shadow-sm border border-border-subtle"
          >
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <Input 
                placeholder="Qual serviço você procura hoje? (ex: Pintor, Professor, TI)" 
                className="pl-12 border-none bg-transparent focus-visible:ring-0 text-base h-12"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button type="submit" className="bg-primary text-white h-12 px-8 rounded-full hover:bg-primary/90 transition-all font-semibold">
              {searching ? 'Buscando...' : 'Buscar'}
            </Button>
          </motion.form>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-10 pb-20">
        <AnimatePresence mode="wait">
          {activeTab === 'explore' ? (
            <motion.div
              key="explore"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              <div className="mb-8">
                <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-6">Membros em Destaque</h3>
              </div>

              {providers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {providers.map((p, idx) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="group h-full flex flex-col hover:border-accent transition-all duration-200 border-border-subtle bg-white rounded-2xl p-6 shadow-none relative">
                        {user && p.uid !== user.uid && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute top-4 right-4 text-text-muted hover:text-accent hover:bg-accent/10 rounded-full"
                            onClick={() => toggleContact(p.uid)}
                          >
                            {profile?.contacts?.includes(p.uid) ? <UserMinus size={18} /> : <UserPlus size={18} />}
                          </Button>
                        )}
                        
                        <div className="mb-4">
                          <Badge className="bg-blue-50 text-accent border-none font-bold text-[10px] uppercase px-2 py-1 rounded">
                            {p.category || 'Serviços'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-4">
                          <Avatar className="w-10 h-10 border border-border-subtle">
                            <AvatarImage src={p.photoURL} />
                            <AvatarFallback>{p.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg font-semibold text-primary">{p.name}</CardTitle>
                          </div>
                        </div>

                        <CardContent className="p-0 flex-grow mb-6">
                          <p className="text-text-muted text-sm leading-relaxed line-clamp-3">
                            {p.bio || 'Membro da comunidade SUD oferecendo serviços de qualidade com integridade e confiança.'}
                          </p>
                        </CardContent>

                        <div className="pt-4 border-t border-border-subtle flex justify-between items-center">
                          <div className="flex items-center gap-1 text-xs text-text-muted">
                            <MapPin size={12} /> {p.location || 'Brasil'}
                          </div>
                          <div className="flex items-center gap-1 text-sm font-bold text-amber-500">
                            <Star size={14} fill="currentColor" /> 5.0
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-border-subtle shadow-sm">
                  <Briefcase className="mx-auto h-10 w-10 text-text-muted/30 mb-4" />
                  <h4 className="text-lg font-medium text-text-muted">Nenhum profissional encontrado</h4>
                  <p className="text-sm text-text-muted/60">Tente buscar por outra categoria ou nome</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="contacts"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <div className="mb-8">
                <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-6">Meus Contatos Salvos</h3>
              </div>

              {savedContacts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {savedContacts.map((p, idx) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="group h-full flex flex-col hover:border-accent transition-all duration-200 border-border-subtle bg-white rounded-2xl p-6 shadow-none relative">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute top-4 right-4 text-accent hover:bg-accent/10 rounded-full"
                          onClick={() => toggleContact(p.uid)}
                        >
                          <UserMinus size={18} />
                        </Button>
                        
                        <div className="flex items-center gap-3 mb-4">
                          <Avatar className="w-12 h-12 border border-border-subtle">
                            <AvatarImage src={p.photoURL} />
                            <AvatarFallback>{p.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg font-semibold text-primary">{p.name}</CardTitle>
                            <p className="text-xs text-text-muted">{p.category || 'Membro'}</p>
                          </div>
                        </div>

                        <CardContent className="p-0 flex-grow mb-6">
                          <p className="text-text-muted text-sm leading-relaxed line-clamp-2">
                            {p.bio || 'Sem descrição disponível.'}
                          </p>
                        </CardContent>

                        <div className="pt-4 border-t border-border-subtle flex gap-2">
                          <Button className="flex-1 bg-primary text-white hover:bg-primary/90 rounded-xl h-10 text-xs font-bold">
                            Ver Perfil
                          </Button>
                          <Button variant="outline" className="flex-1 border-border-subtle hover:bg-background rounded-xl h-10 text-xs font-bold">
                            Mensagem
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-border-subtle shadow-sm">
                  <Users className="mx-auto h-10 w-10 text-text-muted/30 mb-4" />
                  <h4 className="text-lg font-medium text-text-muted">Sua lista de contatos está vazia</h4>
                  <p className="text-sm text-text-muted/60">Adicione membros interessantes para facilitar o contato futuro.</p>
                  <Button 
                    variant="outline" 
                    className="mt-6 rounded-full border-accent text-accent hover:bg-accent/5"
                    onClick={() => setActiveTab('explore')}
                  >
                    Explorar Membros
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-16 text-center text-sm text-text-muted">
          Possui uma empresa ou presta serviços? {' '}
          {user ? (
            !profile?.isProvider && (
              <strong className="text-accent cursor-pointer hover:underline">Cadastre sua Skill agora</strong>
            )
          ) : (
            <AuthModal>
              <strong className="text-accent cursor-pointer hover:underline">Cadastre sua Skill agora</strong>
            </AuthModal>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-border-subtle py-12 px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-sm">
          <div className="flex items-center gap-1">
            <span className="font-extrabold text-primary tracking-tighter">SKILLS<span className="text-accent">Y</span></span>
          </div>
          <p className="text-text-muted">
            © 2026 Skillsy. Criado para fortalecer a comunidade SUD.
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
