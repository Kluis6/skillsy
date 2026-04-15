'use client';

import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useContactsController } from '@/hooks/use-contacts-controller';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, UserMinus, ArrowLeft, Briefcase } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

export default function ContactsPage() {
  const { user, profile, toggleContact, loading: authLoading } = useAuth();
  const { savedContacts, loading: contactsLoading } = useContactsController(profile, 'contacts');

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-text-muted">Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Acesso Restrito</h2>
        <p className="text-text-muted mb-8">Você precisa estar logado para ver seus contatos.</p>
        <Link href="/">
          <Button className="bg-primary text-white font-bold rounded-xl px-8">Voltar para Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-20">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border-subtle px-6 md:px-10 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-surface">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <h1 className="text-xl font-bold tracking-tight text-text-main font-heading flex items-center gap-2">
              <Users size={24} className="text-primary" /> Meus Contatos
            </h1>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-12">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-text-main mb-4 font-heading">Sua Rede de Confiança</h3>
          <p className="text-text-muted text-lg">Mantenha os profissionais que você confia sempre ao seu alcance.</p>
        </div>

        {contactsLoading ? (
          <div className="text-center py-24">
            <p className="text-text-muted">Carregando seus contatos...</p>
          </div>
        ) : savedContacts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {savedContacts.map((p, idx) => (
              <motion.div
                key={p.uid}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="group h-full flex flex-col hover:shadow-2xl transition-all duration-300 border-border-subtle bg-white rounded-[2.5rem] p-8 relative">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-6 right-6 text-primary hover:bg-primary/5 rounded-full"
                    onClick={() => toggleContact(p.uid)}
                  >
                    <UserMinus size={20} />
                  </Button>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="w-16 h-16 border-2 border-surface shadow-sm">
                      <AvatarImage src={p.photoURL} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">{p.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl font-bold text-text-main font-heading">{p.name}</CardTitle>
                      <Badge variant="outline" className="mt-1 border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider">
                        {p.serviceType || p.category || 'Membro'}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-0 flex-grow mb-8">
                    <p className="text-text-muted text-sm leading-relaxed line-clamp-3">
                      {p.bio || 'Sem descrição disponível.'}
                    </p>
                  </CardContent>

                  <div className="pt-6 border-t border-border-subtle flex gap-3">
                    <Link href={`/profile/${p.uid}`} className="flex-1">
                      <Button className="w-full bg-primary text-white hover:bg-primary/90 rounded-2xl h-12 text-sm font-bold shadow-lg shadow-primary/20">
                        Ver Perfil
                      </Button>
                    </Link>
                    <Button variant="outline" className="flex-1 border-border-subtle hover:bg-surface rounded-2xl h-12 text-sm font-bold">
                      Mensagem
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-border-subtle shadow-sm">
            <Users className="mx-auto h-16 w-16 text-text-muted/20 mb-6" />
            <h4 className="text-2xl font-bold text-text-main mb-2">Sua lista está vazia</h4>
            <p className="text-text-muted mb-10 max-w-md mx-auto">Você ainda não salvou nenhum contato. Explore a comunidade para encontrar profissionais incríveis.</p>
            <Link href="/">
              <Button className="rounded-2xl bg-primary text-white font-bold px-12 h-14 text-lg shadow-xl shadow-primary/20">
                Explorar Membros
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
