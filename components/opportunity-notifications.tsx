"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, BriefcaseBusiness, CheckCheck, Clock3 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/hooks/use-auth";
import { UserNotification } from "@/models/types";
import { UserNotificationService } from "@/services/user-notification-service";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

function timeAgo(value: unknown) {
  if (!value || typeof value !== "object" || !("seconds" in value)) return "Agora";
  return formatDistanceToNow(new Date(Number(value.seconds) * 1000), { addSuffix: true, locale: ptBR });
}

export function OpportunityNotifications() {
  const { user } = useAuth();
  const [items, setItems] = useState<UserNotification[]>([]);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const unread = items.filter((item) => !item.read).length;

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }
    return UserNotificationService.subscribe(user.uid, setItems);
  }, [user?.uid]);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  if (!user) return null;

  return (
    <div ref={panelRef} className="relative">
      <Button variant="ghost" size="icon" className="relative" aria-label="Abrir notificações" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <Bell className="size-5" />
        {unread > 0 ? <span className="absolute right-0 top-0 flex size-4 items-center justify-center rounded-full bg-destructive text-[11px] font-bold text-white">{unread > 9 ? "9+" : unread}</span> : null}
      </Button>
      {open ? (
        <div className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-md border border-border-subtle bg-popover shadow-sm">
          <div className="flex items-center justify-between border-b border-border-subtle bg-surface px-4 py-3"><p className="text-sm font-semibold">Oportunidades</p><Link href="/oportunidades/para-voce" onClick={() => setOpen(false)} className="text-xs font-semibold text-primary">Ver todas</Link></div>
          <ScrollArea className="max-h-80">
            {items.length ? items.map((item) => <Link key={item.id} href={item.type === "opportunity_match" ? "/oportunidades/para-voce" : "/oportunidades"} onClick={() => { if (!item.read) void UserNotificationService.markAsRead(user.uid, item.id); setOpen(false); }} className={`flex gap-3 border-b border-border-subtle p-4 transition-colors hover:bg-surface ${item.read ? "" : "bg-primary/5"}`}><BriefcaseBusiness className="mt-0.5 size-4 shrink-0 text-primary" /><span className="min-w-0"><span className="block text-sm font-medium text-text-main">{item.title}</span><span className="mt-1 block text-xs leading-relaxed text-text-muted">{item.message}</span><span className="mt-2 flex items-center gap-1 text-xs text-text-muted"><Clock3 className="size-3" />{timeAgo(item.createdAt)}</span></span></Link>) : <div className="p-8 text-center"><CheckCheck className="mx-auto mb-2 size-6 text-primary" /><p className="text-sm text-text-muted">Nenhuma oportunidade nova.</p></div>}
          </ScrollArea>
        </div>
      ) : null}
    </div>
  );
}
