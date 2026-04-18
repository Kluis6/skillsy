'use client';

import React from 'react';
import { 
  Users, 
  UserMinus, 
  Briefcase, 
  MapPin, 
  Building2, 
  MessageCircle, 
  ShieldCheck, 
  Star, 
  Info 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserProfile } from '@/models/types';
import { useContactsStore } from '@/store/use-contacts-store';
import { toast } from 'sonner';

interface ContactsMainProps {
  contacts: UserProfile[];
  toggleContact: (uid: string) => Promise<void>;
}

export function ContactsMain({ contacts, toggleContact }: ContactsMainProps) {
  const { selectedContactId, setSelectedContactId } = useContactsStore();

  const selectedContact = contacts.find(c => c.uid === selectedContactId) || 
                         (contacts.length > 0 ? contacts[0] : null);

  return (
    <main className="flex-grow overflow-y-auto bg-surface/30 custom-scrollbar p-4 md:p-8">
      <AnimatePresence mode="wait">
        {selectedContact ? (
          <motion.div
            key={selectedContact.uid}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-4xl mx-auto space-y-8"
          >
            {/* Profile Hero (LinkedIn Style) */}
            <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-primary/5 overflow-hidden bg-card">
              <div className="relative h-40 md:h-56 bg-gradient-to-r from-primary/20 to-accent/20">
                {selectedContact.bannerURL && (
                  <Image 
                    src={selectedContact.bannerURL} 
                    alt="Banner" 
                    fill 
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
              <CardContent className="px-8 pb-10">
                <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 md:-mt-20 mb-6">
                  <Avatar className="w-32 h-32 md:w-40 md:h-40 border-[6px] border-card shadow-xl">
                    <AvatarImage src={selectedContact.photoURL} />
                    <AvatarFallback className="bg-surface text-primary font-bold text-4xl">
                      {selectedContact.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-grow text-center md:text-left pb-2">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                      <h2 className="text-2xl md:text-3xl font-bold text-text-main font-heading tracking-tight">{selectedContact.name}</h2>
                      {selectedContact.verifiedMember && (
                        <ShieldCheck size={24} className="text-primary" />
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <p className="text-base md:text-lg font-medium text-text-main/80">
                        {selectedContact.serviceType || selectedContact.category || 'Membro da Comunidade'}
                      </p>
                      {selectedContact.companyName && (
                        <p className="text-primary font-bold flex items-center justify-center md:justify-start gap-2 text-sm">
                          <Building2 size={16} /> {selectedContact.companyName}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-xs text-text-muted">
                      <p className="flex items-center gap-1.5">
                        <MapPin size={14} /> {selectedContact.location || 'Localização não informada'}
                      </p>
                      <p className="flex items-center gap-1.5 text-primary font-bold">
                        <Users size={14} /> {selectedContact.contacts?.length || 0} conexões
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center gap-2 mt-4 md:mt-0">
                    <Button 
                      onClick={() => {
                        toggleContact(selectedContact.uid).then(() => {
                          toast.success('Contato removido');
                          setSelectedContactId(null);
                        });
                      }}
                      variant="outline"
                      className="rounded-full h-10 px-6 font-bold border-primary text-primary hover:bg-primary/5"
                    >
                      <UserMinus size={18} className="mr-2" /> Remover
                    </Button>
                    <Button className="rounded-full h-10 px-6 bg-green-500 text-white hover:bg-green-600 font-bold shadow-lg shadow-green-200">
                      <MessageCircle size={18} className="mr-2" /> WhatsApp
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-border-subtle w-full">
                  <div className="text-center md:text-left">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Especialidade</p>
                    <p className="font-bold text-primary truncate text-sm">{selectedContact.serviceType || selectedContact.category || 'Membro'}</p>
                  </div>
                  <div className="text-center md:text-left">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Avaliação</p>
                    <div className="flex items-center justify-center md:justify-start gap-1 font-bold text-highlight text-sm">
                      <Star size={14} fill="currentColor" /> {selectedContact.rating || '0.0'}
                    </div>
                  </div>
                  <div className="text-center md:text-left">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Localização</p>
                    <p className="font-bold text-text-main truncate text-sm">{selectedContact.ward || 'Geral'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bio & Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <section className="bg-card rounded-[2rem] p-6 shadow-sm border border-border-subtle">
                  <h3 className="text-lg font-bold mb-4 font-heading flex items-center gap-2">
                    <Info size={18} className="text-primary" /> Sobre o Profissional
                  </h3>
                  <p className="text-text-muted text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedContact.bio || 'Este membro ainda não adicionou uma descrição detalhada ao seu perfil.'}
                  </p>
                </section>

                {selectedContact.isProvider && (
                  <section className="bg-card rounded-[2rem] p-6 shadow-sm border border-border-subtle">
                    <h3 className="text-lg font-bold mb-4 font-heading flex items-center gap-2">
                      <Briefcase size={18} className="text-primary" /> Serviços Oferecidos
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(selectedContact.serviceType || 'Serviços Gerais').split(',').map((s, i) => (
                        <Badge key={i} variant="secondary" className="bg-surface text-text-main px-3 py-1.5 rounded-lg border-none font-medium text-xs">
                          {s.trim()}
                        </Badge>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              <div className="space-y-6">
                <Link href={`/profile/${selectedContact.uid}`} className="block">
                  <Button className="w-full h-12 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/10">
                    Ver Perfil Completo
                  </Button>
                </Link>
                
                <Card className="rounded-[2rem] border-border-subtle bg-card p-6">
                  <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-primary" /> Verificação
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-muted">Membro desde</span>
                      <span className="font-bold text-text-main">
                        {selectedContact.createdAt ? new Date(selectedContact.createdAt as any).toLocaleDateString() : '2024'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-muted">Status</span>
                      <Badge className="bg-green-500/10 text-green-500 border-none text-[10px] font-bold">Ativo</Badge>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-12">
            <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mb-6">
              <Users size={48} className="text-primary/20" />
            </div>
            <h3 className="text-2xl font-bold text-text-main mb-2">Selecione um contato</h3>
            <p className="text-text-muted max-w-sm">
              Escolha um profissional da sua lista à esquerda para visualizar os detalhes do perfil e entrar em contato.
            </p>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
