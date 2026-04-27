"use client";

import { Search, ChevronRight, UserMinus, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserProfile } from "@/models/types";
import { useContactsStore } from "@/store/use-contacts-store";
import { toast } from "sonner";
import Link from "next/link";
import { LuArrowLeft } from "react-icons/lu";

interface ContactsAsideProps {
  contacts: UserProfile[];
  loading: boolean;
  toggleContact: (uid: string) => Promise<void>;
  onContactToggle?: () => void;
}

export function ContactsAside({
  contacts,
  loading,
  toggleContact,
  onContactToggle,
}: ContactsAsideProps) {
  const {
    selectedContactId,
    setSelectedContactId,
    searchQuery,
    setSearchQuery,
  } = useContactsStore();

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleContactToggle = () => {
    onContactToggle?.();
  };

  const handleSelectContact = (contactId: string) => {
    setSelectedContactId(contactId);
    handleContactToggle();
  };

  return (
    <aside className="w-full bg-card flex flex-col h-screen overflow-hidden">
      <div className="p-4 border-b border-border-s flex flex-col space-y-4">
        <div>
          <Link href="/" className="flex justify-start items-center space-x-2"> <LuArrowLeft className="text" /> <p className="text-gray-700 font-normal text-sm">Voltar</p></Link>
        </div>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted/40"
            size={16}
          />
          <Input
            placeholder="Buscar contatos..."
            className="pl-10 h-10 text-sm focus:bg-white placeholder:text-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="h-full overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
        ) : filteredContacts.length > 0 ? (
          <div className="divide-y divide-border-subtle/50">
            {filteredContacts.map((c) => (
              <button
                key={c.uid}
                onClick={() => handleSelectContact(c.uid)}
                className={`w-full p-4 flex items-center gap-4 transition-all hover:bg-primary/5 text-left relative group ${
                  selectedContactId === c.uid ? "bg-primary/5" : ""
                }`}
              >
                {selectedContactId === c.uid && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                )}
                <Avatar className="w-12 h-12 border border-border-subtle">
                  <AvatarImage src={c.photoURL} />
                  <AvatarFallback className="bg-surface text-primary font-bold">
                    {c.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-text-main truncate text-sm">
                      {c.name}
                    </h4>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleContact(c.uid).then(() => {
                            toast.success("Contato removido");
                            if (selectedContactId === c.uid)
                              setSelectedContactId(null);
                            onContactToggle?.();
                          });
                        }}
                      >
                        <UserMinus size={14} />
                      </Button>
                      <ChevronRight
                        size={14}
                        className="text-text-muted/30 group-hover:opacity-0 transition-opacity"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-text-muted truncate font-medium">
                    {c.companyName || c.category || "Membro"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-text-muted/20 mb-4" />
            <p className="text-sm text-text-muted font-medium">
              Nenhum contato encontrado
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
