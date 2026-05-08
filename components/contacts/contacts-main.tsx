"use client";

import { PiShareFat } from "react-icons/pi";
import {
  Users,
  UserMinus,
  MapPin,
  Building2,
  ShieldCheck,
  Star,
  Copy,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfile } from "@/models/types";
import { useContactsStore } from "@/store/use-contacts-store";
import { toast } from "sonner";
import { SidebarTrigger } from "../ui/sidebar";
import { BsWhatsapp } from "react-icons/bs";
import { TooltipContent, Tooltip, TooltipTrigger } from "../ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LuChurch, LuUserRound } from "react-icons/lu";
import { FaTelegramPlane } from "react-icons/fa";

interface ContactsMainProps {
  contacts: UserProfile[];
  toggleContact: (uid: string) => Promise<void>;
}

export function ContactsMain({ contacts, toggleContact }: ContactsMainProps) {
  const { selectedContactId, setSelectedContactId } = useContactsStore();

  const selectedContact =
    contacts.find((c) => c.uid === selectedContactId) ||
    (contacts.length > 0 ? contacts[0] : null);

  const shareUrl = selectedContact
    ? typeof window === "undefined"
      ? `/profile/${selectedContact.uid}`
      : `${window.location.origin}/profile/${selectedContact.uid}`
    : "";

  const canUseNativeShare =
    typeof navigator !== "undefined" && "share" in navigator;

  const getWhatsAppNumber = (contact: UserProfile) => {
    const rawNumber =
      contact.whatsapp || contact.phone || contact.phones?.find(Boolean) || "";

    return rawNumber.replace(/\D/g, "");
  };

  const handleWhatsApp = () => {
    if (!selectedContact) return;

    const phone = getWhatsAppNumber(selectedContact);

    if (!phone) {
      toast.error("WhatsApp não informado", {
        description: "Este contato ainda não possui um número disponível.",
      });
      return;
    }

    const normalizedPhone = phone.startsWith("55") ? phone : `55${phone}`;
    window.open(
      `https://wa.me/${normalizedPhone}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copiado", {
        description: "Agora você pode compartilhar o perfil do contato.",
      });
    } catch {
      toast.error("Não foi possível copiar o link");
    }
  };

  const handleNativeShare = async () => {
    if (!selectedContact || !shareUrl || !canUseNativeShare) return;

    try {
      await navigator.share({
        title: selectedContact.name,
        text: `Confira o contato de ${selectedContact.name} no Skillsy.`,
        url: shareUrl,
      });
    } catch {
      // Usuario cancelou ou o navegador bloqueou a acao.
    }
  };

  const handleWhatsAppShare = () => {
    if (!selectedContact || !shareUrl) return;

    const message = `Confira o contato de ${selectedContact.name} no Skillsy: ${shareUrl}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleTelegramShare = () => {
    if (!selectedContact || !shareUrl) return;

    const message = `Confira o contato de ${selectedContact.name} no Skillsy: ${shareUrl}`;
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const shareActions = [
    {
      label: "Compartilhar no WhatsApp",
      description: "Envie o contato no WhatsApp.",
      icon: BsWhatsapp,
      onClick: handleWhatsAppShare,
      className: "text-green-600 ",
    },
    {
      label: "Compartilhar no Telegram",
      description: "Envie o contato no Telegram.",
      icon: FaTelegramPlane,
      onClick: handleTelegramShare,
      className: "text-sky-500 ",
    },
    {
      label: "Copiar link",
      description: "Copia o link para a area de transferencia.",
      icon: Copy,
      onClick: handleCopyLink,
      className: "text-sky-600 ",
    },
  ];

  const renderShareButton = (className?: string) => {
    if (canUseNativeShare) {
      return (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                className={className}
                onClick={handleNativeShare}
              />
            }
          >
            <PiShareFat className="text-gray-700 " />
          </TooltipTrigger>
          <TooltipContent>
            <p>Compartilhar</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Sheet>
        <Tooltip>
          <SheetTrigger
            render={
              <TooltipTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    className={className}
                  />
                }
              >
                <PiShareFat className="text-gray-700" />
              </TooltipTrigger>
            }
          />
          <TooltipContent>
            <p>Compartilhar</p>
          </TooltipContent>
        </Tooltip>
        {renderShareSheet()}
      </Sheet>
    );
  };

  const renderShareSheet = () => (
    <SheetContent side="bottom" className="rounded-t-lg">
      <SheetHeader className="text-left">
        <SheetTitle>Compartilhar contato</SheetTitle>
        <SheetDescription className="">
          Envie o contato de <strong>{selectedContact?.name}</strong> por:
        </SheetDescription>
      </SheetHeader>
      <div className="gap-2 p-4 flex md:flex-row flex-col w-full">
        {shareActions.map((action) => {
          const Icon = action.icon;

          return (
            <SheetClose
              key={action.label}
              render={
                <Button
                  type="button"
                  variant="outline"
                  className="h-auto w-full md:w-1/3 justify-start gap-3 p-4 text-left rounded-sm"
                  onClick={action.onClick}
                />
              }
            >
              <span className={action.className}>
                <Icon className="size-5" />
              </span>
              <span className="flex min-w-0 flex-col items-start">
                <span className="font-semibold text-gray-800">
                  {action.label}
                </span>
                <span className="text-xs text-muted-foreground whitespace-normal">
                  {action.description}
                </span>
              </span>
            </SheetClose>
          );
        })}
      </div>
    </SheetContent>
  );

  return (
    <main className="w-full bg-surface relative custom-scrollbar overflow-y-auto">
      <div className="right-0 flex md:hidden py-2 px-4 sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border-subtle h-[60px] ">
        <SidebarTrigger className="flex justify-start items-center h-10 px-0 " />
      </div>
      <AnimatePresence mode="sync" initial={false}>
        {selectedContact ? (
          <motion.div
            key={selectedContact.uid}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 0, transition: { duration: 0 } }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="w-full h-full space-y-2"
          >
            {/* Profile Hero (LinkedIn Style) */}

            <div className="w-full bg-white">
              <div className="relative w-full h-52 md:h-68">
                <div className="h-40 md:h-50 w-full relative">
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
                <Avatar className="size-30 md:size-38 border-[6px] border-card shadow-xl absolute bottom-0 md:left-4 left-1/2 -translate-x-1/2 md:translate-x-1">
                  <AvatarImage src={selectedContact.photoURL} />
                  <AvatarFallback className="bg-surface text-primary font-bold text-4xl">
                    {selectedContact.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex justify-end p-4 gap-x-2">
                  {renderShareButton(
                    "hidden md:flex justify-center items-center size-10 rounded-sm",
                  )}

                  <Button
                    type="button"
                    onClick={handleWhatsApp}
                    className="h-10 px-6 hidden rounded-sm md:flex bg-green-500 text-white hover:bg-green-600 font-bold space-x-1"
                  >
                    <BsWhatsapp className="size-4" /> <p>WhatsApp</p>
                  </Button>
                  <div className="flex justify-end md:text-right md:hidden flex-col">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted drop-shadow-xl">
                      Avaliação
                    </p>
                    <div className="flex items-center justify-start drop-shadow-xl gap-1 font-bold text-highlight text-base">
                      <Star size={14} fill="currentColor" />
                      {selectedContact.rating || "0.0"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full bg-white p-4 border-b">
                <div className="flex flex-col md:flex-row items-center justify-center md:items-end gap-6 w-full">
                  <div className="text-center md:text-left w-full space-y-1">
                    <div className="flex md:justify-between items-center justify-center">
                      <div className="flex items-center justify-center  md:justify-start gap-x-1">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 font-heading tracking-tight">
                          {selectedContact.name}
                        </h2>
                        {selectedContact.verifiedMember && (
                          <ShieldCheck size={24} className="text-primary" />
                        )}
                      </div>

                      <div className="text-center md:text-left md:flex flex-col hidden">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted drop-shadow-xl">
                          Avaliação
                        </p>
                        <div className="flex items-center justify-center drop-shadow-xl md:justify-start gap-1 font-bold text-highlight text-base">
                          <Star size={14} fill="currentColor" />
                          {selectedContact.rating || "0.0"}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-1">
                      <p className="text-base font-medium text-gray-700">
                        {selectedContact.serviceType ||
                          selectedContact.category ||
                          "Membro da Comunidade"}
                      </p>
                    </div>
                    {selectedContact.companyName && (
                      <div className="flex items-center gap-x-2 w-full justify-center md:justify-start">
                        <Building2 size={16} className="text-gray-700" />
                        <p className="text-gray-700 font-normal text-sm flex items-center justify-center md:justify-start gap-2">
                          {selectedContact.companyName}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center space-x-2 justify-center md:justify-start ">
                      <MapPin size={14} />
                      <p className="text-gray-700 text-sm font-normal">
                        {selectedContact.location ||
                          "Localização não informada"}
                      </p>
                    </div>

                    <div className="text-center md:text-left flex items-center justify-center md:justify-start text-primary space-x-2">
                      <LuChurch size={14} />
                      <p className="text-primary font-medium truncate text-sm">
                        {selectedContact.ward || "Geral"}
                      </p>
                    </div>
                  </div>

                  <div className="flex md:hidden flex-wrap justify-center gap-2">
                    {renderShareButton("size-10 rounded-sm")}

                    <Button
                      type="button"
                      onClick={handleWhatsApp}
                      className="h-10 px-6 flex bg-green-500 text-white hover:bg-green-600 font-bold space-x-1 rounded-sm"
                    >
                      <BsWhatsapp className="size-4" /> <p>WhatsApp</p>
                    </Button>
                  </div>
                </div>

                {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4  w-full">
                  <div className="text-center md:text-left">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">
                      Especialidade
                    </p>
                    <p className="font-bold text-primary truncate text-sm">
                      {selectedContact.serviceType ||
                        selectedContact.category ||
                        "Membro"}
                    </p>
                  </div>
                  <div className="text-center md:text-left">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">
                      Avaliação
                    </p>
                    <div className="flex items-center justify-center md:justify-start gap-1 font-bold text-highlight text-sm">
                      <Star size={14} fill="currentColor" />{" "}
                      {selectedContact.rating || "0.0"}
                    </div>
                  </div>
                </div> */}
              </div>
            </div>

            {/* Bio & Details */}
            <div className="border-y">
              <div className="md:col-span-2 space-y-6">
                <section className="bg-white p-4 border-border-subtle">
                  <h3 className="text-lg font-bold font-heading text-gray-700">
                    Sobre o Profissional
                  </h3>
                  <p className="text-text-muted text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedContact.bio ||
                      "Este membro ainda não adicionou uma descrição detalhada ao seu perfil."}
                  </p>
                </section>

                {/* {selectedContact.isProvider && (
                  <section className="bg-card rounded-[2rem] p-6 shadow-sm border border-border-subtle">
                    <h3 className="text-lg font-bold mb-4 font-heading flex items-center gap-2">
                      <Briefcase size={18} className="text-primary" /> Serviços
                      Oferecidos
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(selectedContact.serviceType || "Serviços Gerais")
                        .split(",")
                        .map((s, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="bg-surface text-text-main px-3 py-1.5 rounded-lg border-none font-medium text-xs"
                          >
                            {s.trim()}
                          </Badge>
                        ))}
                    </div>
                  </section>
                )} */}
              </div>
            </div>
            <div className="p-4 bg-white w-full border-y flex flex-col md:flex-row gap-2 flex-nowrap">
              <Button
                onClick={() => {
                  toggleContact(selectedContact.uid).then(() => {
                    toast.success("Contato removido");
                    setSelectedContactId(null);
                  });
                }}
                variant="destructive"
                className="h-10 md:w-1/2 w-full font-bold space-x-2 rounded-sm"
              >
                <UserMinus size={18} /> <p>Remover contato</p>
              </Button>
              <Link
                className="h-10 w-full flex justify-center items-center space-x-2 text-white font-bold bg-blue-500 hover:bg-blue-600 active:bg-blue-700 rounded-sm"
                href={`/profile/${selectedContact.uid}`}
              >
                <LuUserRound size={18} /> <p className="text-sm">Ver contato</p>
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-12">
            <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mb-6">
              <Users size={48} className="text-primary/20" />
            </div>
            <h3 className="text-2xl font-bold text-text-main mb-2">
              Selecione um contato
            </h3>
            <p className="text-text-muted max-w-sm">
              Escolha um profissional da sua lista à esquerda para visualizar os
              detalhes do perfil e entrar em contato.
            </p>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
