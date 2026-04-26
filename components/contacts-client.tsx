'use client';

import { useAuth } from '@/hooks/use-auth';
import { useContactsController } from '@/hooks/use-contacts-controller';
import { Button } from '@/components/ui/button';
import { Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from '@/components/theme-toggle';
import { ContactsAside } from './contacts/contacts-aside';
import { ContactsMain } from './contacts/contacts-main';

export function ContactsClient() {
  const { user, profile, toggleContact, loading: authLoading } = useAuth();
  const { savedContacts, loading: contactsLoading } = useContactsController(profile, 'contacts');

  if (authLoading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col">
        <nav className="h-16 bg-background/80 backdrop-blur-md border-b border-border-subtle px-6 flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </nav>
        <div className="flex-grow flex overflow-hidden">
          <aside className="w-80 border-r border-border-subtle bg-card hidden md:block">
            <div className="p-4 space-y-4">
              <Skeleton className="h-10 w-full rounded-xl" />
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-20 w-full rounded-2xl" />
              ))}
            </div>
          </aside>
          <main className="flex-grow p-8">
            <Skeleton className="h-64 w-full rounded-[2.5rem] mb-8" />
            <Skeleton className="h-40 w-full rounded-[2.5rem]" />
          </main>
        </div>
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
    <div className="h-screen bg-surface flex flex-col overflow-hidden">
      {/* Header */}
      <nav className="h-16 bg-background/80 backdrop-blur-md border-b border-border-subtle px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-surface">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-text-main font-heading">Minha Rede</h1>
        </div>
        <ThemeToggle />
      </nav>

      <div className="flex-grow flex overflow-hidden">
        <ContactsAside 
          contacts={savedContacts} 
          loading={contactsLoading} 
          toggleContact={toggleContact} 
        />
        <ContactsMain 
          contacts={savedContacts} 
          toggleContact={toggleContact} 
        />
      </div>
    </div>
  );
}
