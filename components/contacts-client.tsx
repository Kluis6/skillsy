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

import { Skeleton } from "@/components/ui/skeleton";

import { ThemeToggle } from '@/components/theme-toggle';

export function ContactsClient() {
  const { user, profile, toggleContact, loading: authLoading } = useAuth();
  const { savedContacts, loading: contactsLoading } = useContactsController(profile, 'contacts');

  if (authLoading) {
    return (
      <div className="min-h-screen bg-surface pb-20">
        <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border-subtle px-6 md:px-10 py-4">
          <div className="max-w-7xl mx-auto">
            <Skeleton className="h-10 w-48 rounded-xl" />
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-6 mt-10">
          <div className="mb-12">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-6 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-80 w-full rounded-[2.5rem]" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-surface">
        <Users size={64} className="text-text-muted mb-6" />
        <h1 className="text-3xl font-bold mb-4">Acesso Restrito</h1>
        <p className="text-text-muted mb-8">Você precisa estar logado para ver seus contatos.</p>
        <Link href="/">
          <Button className="bg-primary text-white font-bold rounded-xl px-8">Voltar para Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border-subtle px-6 md:px-10 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-surface">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-text-main font-heading">Meus Contatos</h1>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-10">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-text-main mb-2">Sua Rede de Confiança</h2>
          <p className="text-text-muted text-lg">Mantenha os profissionais que você confia sempre ao seu alcance.</p>
        </div>

        {contactsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-80 w-full rounded-[2.5rem]" />
            ))}
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
                <Card className="group h-full flex flex-col hover:shadow-2xl transition-all duration-300 border-border-subtle bg-card rounded-[2.5rem] p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-surface rounded-bl-full -mr-12 -mt-12 transition-all group-hover:bg-primary/10" />
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-4 right-4 text-primary hover:bg-primary/5 rounded-full z-10"
                    onClick={() => toggleContact(p.uid)}
                  >
                    <UserMinus size={20} />
                  </Button>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="w-16 h-16 border-2 border-surface shadow-sm">
                      <AvatarImage src={p.photoURL} />
                      <AvatarFallback className="bg-surface text-primary font-bold text-2xl">{p.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl font-bold text-text-main">{p.name}</CardTitle>
                      <Badge variant="outline" className="mt-1 border-primary/20 text-primary text-[10px] font-bold uppercase px-3 py-1 rounded-full">
                        {p.category || 'Membro'}
                      </Badge>
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
          <div className="text-center py-24 bg-card rounded-[3rem] border-2 border-dashed border-border-subtle">
            <Users className="mx-auto h-12 w-12 text-text-muted/20 mb-4" />
            <h4 className="text-xl font-bold text-text-main">Sua lista está vazia</h4>
            <p className="text-sm text-text-muted mb-8">Você ainda não salvou nenhum contato na sua rede.</p>
            <Link href="/">
              <Button className="rounded-full bg-primary text-white font-bold px-8 h-12">
                Explorar Profissionais
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
