"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, Inbox, Loader2, Mail, Reply } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { UserService } from "@/services/user-service";
import type { SupportMessage } from "@/models/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type MessageFilter = "unread" | "all";

const FILTER_LABELS: Record<MessageFilter, string> = {
  unread: "Não lidas",
  all: "Todas",
};

function messageDate(message: SupportMessage) {
  const seconds = message.createdAt?.seconds;
  return typeof seconds === "number" ? new Date(seconds * 1000) : null;
}

function replyHref(message: SupportMessage) {
  const subject = encodeURIComponent("Re: sua mensagem para a Skillsy");
  const quoted = message.message
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");
  const body = encodeURIComponent(`Olá, ${message.name}!\n\n\n\n${quoted}`);
  return `mailto:${message.email}?subject=${subject}&body=${body}`;
}

export function AdminMessagesClient() {
  const { profile, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<MessageFilter>("unread");

  // Same loading pattern as the moderation queue: state is only set in the
  // promise callbacks.
  const loadMessages = useCallback(() => {
    if (profile?.role !== "admin") return Promise.resolve();
    return UserService.getSupportMessages()
      .then(setMessages)
      .catch((error) => {
        console.error("Unable to load support messages", error);
        toast.error("Não foi possível carregar as mensagens.");
      })
      .finally(() => setLoading(false));
  }, [profile?.role]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  const unreadCount = useMemo(
    () => messages.filter((message) => !message.read).length,
    [messages],
  );

  const visibleMessages = useMemo(
    () =>
      filter === "unread"
        ? messages.filter((message) => !message.read)
        : messages,
    [filter, messages],
  );

  // Optimistic: the list changes at once and goes back if the write fails.
  const setRead = async (message: SupportMessage, read: boolean) => {
    const apply = (value: boolean) =>
      setMessages((current) =>
        current.map((item) =>
          item.id === message.id ? { ...item, read: value } : item,
        ),
      );
    apply(read);
    try {
      await UserService.setSupportMessageRead(message.id, read);
    } catch (error) {
      console.error("Unable to update support message", error);
      apply(message.read);
      toast.error("Não foi possível atualizar a mensagem.");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2
          className="size-8 animate-spin text-primary"
          aria-label="Carregando mensagens"
        />
      </div>
    );
  }

  if (profile?.role !== "admin") return null;

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-8 md:py-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-text-main">
            Mensagens de contato
          </h1>
          <p className="max-w-2xl text-sm text-text-muted">
            Enviadas pelo &ldquo;Fale conosco&rdquo; da página inicial. Responda
            por e-mail e marque como lida quando resolver.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setLoading(true);
            void loadMessages();
          }}
        >
          Atualizar
        </Button>
      </header>

      <section className="overflow-hidden border border-border-subtle bg-card shadow-xs">
        <div className="flex flex-col gap-3 border-b border-border-subtle p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-text-main">Caixa de entrada</h2>
            <p className="text-xs text-text-muted">
              {unreadCount === 1
                ? "1 mensagem não lida"
                : `${unreadCount} mensagens não lidas`}{" "}
              · {messages.length} no total
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Label
              htmlFor="messages-filter"
              className="text-sm text-text-muted"
            >
              Mostrar
            </Label>
            <Select
              items={FILTER_LABELS}
              value={filter}
              onValueChange={(value) => value && setFilter(value)}
            >
              <SelectTrigger
                id="messages-filter"
                className="h-9 min-w-32 bg-card px-2 text-sm"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FILTER_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {visibleMessages.length === 0 ? (
          <div className="p-10 text-center">
            <Inbox
              className="mx-auto mb-3 size-8 text-text-muted"
              aria-hidden="true"
            />
            <p className="font-medium text-text-main">
              {filter === "unread"
                ? "Nenhuma mensagem para ler"
                : "Nenhuma mensagem recebida"}
            </p>
            <p className="mt-1 text-sm text-text-muted">
              Quando alguém escrever pelo &ldquo;Fale conosco&rdquo;, a mensagem
              aparece aqui e no sino de notificações.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {visibleMessages.map((message) => {
              const createdAt = messageDate(message);
              return (
                <article
                  key={message.id}
                  className={`flex flex-col gap-4 p-4 lg:flex-row lg:items-start ${message.read ? "" : "bg-primary/5"}`}
                >
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-text-main">
                        {message.name}
                      </p>
                      {!message.read && (
                        <Badge className="border-primary/20 bg-primary/10 text-primary">
                          Nova
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
                      <a
                        href={`mailto:${message.email}`}
                        className="hover:text-primary hover:underline"
                      >
                        {message.email}
                      </a>
                      <span>
                        {createdAt
                          ? formatDistanceToNow(createdAt, {
                              addSuffix: true,
                              locale: ptBR,
                            })
                          : "Data indisponível"}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-text-main">
                      {message.message}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button
                      render={<a href={replyHref(message)} />}
                      nativeButton={false}
                      onClick={() => {
                        if (!message.read) void setRead(message, true);
                      }}
                      className="gap-2"
                    >
                      <Reply size={16} /> Responder por e-mail
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void setRead(message, !message.read)}
                      className="gap-2"
                    >
                      {message.read ? (
                        <>
                          <Mail size={16} /> Marcar como não lida
                        </>
                      ) : (
                        <>
                          <Check size={16} /> Marcar como lida
                        </>
                      )}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
