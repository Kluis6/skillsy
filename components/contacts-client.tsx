"use client";

import { useAuth } from "@/hooks/use-auth";
import { useContactsController } from "@/hooks/use-contacts-controller";
import { Button } from "@/components/ui/button";
import { ContactsPageLoading } from "@/components/loading/route-loaders";
import { Users } from "lucide-react";
import Link from "next/link";
import { AppSidebar } from "./appsidebar";
import { ContactsAside } from "./contacts/contacts-aside";
import { ContactsMain } from "./contacts/contacts-main";

export function ContactsClient() {
  const { user, profile, toggleContact, loading: authLoading } = useAuth();
  const { savedContacts, loading: contactsLoading } = useContactsController(
    profile,
    "contacts",
  );

  if (authLoading) {
    return <ContactsPageLoading />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-surface">
        <Users size={64} className="text-text-muted mb-6" />
        <h1 className="text-3xl font-bold mb-4">Acesso Restrito</h1>
        <p className="text-text-muted mb-8">
          Você precisa estar logado para ver seus contatos.
        </p>
        <Link href="/">
          <Button className="bg-primary text-white font-bold rounded-xl px-8">
            Voltar para Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-surface flex flex-col overflow-hidden">
      {/* Header */}

      <div className="flex-grow flex overflow-hidden">
        <AppSidebar>
          <ContactsAside
            contacts={savedContacts}
            loading={contactsLoading}
            toggleContact={toggleContact}
          />
        </AppSidebar>
        <ContactsMain contacts={savedContacts} toggleContact={toggleContact} />
      </div>
    </div>
  );
}
