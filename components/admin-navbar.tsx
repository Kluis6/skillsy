'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  LayoutDashboard, 
  Users, 
  FileText,
  ShieldCheck, 
  LogOut, 
  Home,
  Settings,
  Bell,
  Check,
  Clock,
  ChevronRight
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { NotificationService, AdminNotification } from '@/services/notification-service';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function AdminNavbar() {
  const { user, profile, logout } = useAuth();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (profile?.role === 'admin') {
      const unsubscribe = NotificationService.subscribeToNotifications((data) => {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      });
      return () => unsubscribe();
    }
  }, [profile]);

  useEffect(() => {
    if (!notificationsOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [notificationsOpen]);

  const handleMarkAsRead = async (id: string) => {
    await NotificationService.markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await NotificationService.markAllAsRead(notifications);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'new_user': return <Users size={14} className="text-blue-500" />;
      case 'report': return <ShieldCheck size={14} className="text-red-500" />;
      default: return <Bell size={14} className="text-primary" />;
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border-subtle px-6 md:px-10 py-3">
      <div className="max-w-[1600px] mx-auto flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <ShieldCheck className="text-white" size={20} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-black tracking-tighter uppercase leading-none">Skillsy</h1>
              <span className="text-xs font-bold text-primary">Admin Panel</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1 bg-surface rounded-xl p-1 border border-border-subtle">
            <Button render={<Link href="/admin" />} nativeButton={false} variant="ghost" size="sm" className="rounded-lg gap-2 font-bold text-xs h-9 px-4 bg-card shadow-sm">
              <LayoutDashboard size={14} /> Dashboard
            </Button>
            <Button render={<Link href="/admin/usuarios" />} nativeButton={false} variant="ghost" size="sm" className="rounded-lg gap-2 font-bold text-xs h-9 px-4 text-text-muted hover:text-primary">
              <Users size={14} /> Usuários
            </Button>
            <Button render={<Link href="/admin/artigos" />} nativeButton={false} variant="ghost" size="sm" className="rounded-lg gap-2 font-bold text-xs h-9 px-4 text-text-muted hover:text-primary">
              <FileText size={14} /> Artigos
            </Button>
            <Button render={<Link href="/" />} nativeButton={false} variant="ghost" size="sm" className="rounded-lg gap-2 font-bold text-xs h-9 px-4 text-text-muted hover:text-primary">
              <Home size={14} /> Ver Site
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 mr-2">
            <div className="relative" ref={notificationsRef}>
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full text-text-muted hover:text-primary"
                onClick={() => setNotificationsOpen((open) => !open)}
                aria-expanded={notificationsOpen}
                aria-haspopup="dialog"
              >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-background">
                      {unreadCount}
                    </span>
                  )}
              </Button>
              {notificationsOpen && (
                <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-md border border-border-subtle bg-popover p-0 text-popover-foreground shadow-sm">
                <div className="p-4 bg-surface border-b border-border-subtle flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-normal text-text-main flex items-center gap-2">
                    <Bell size={14} className="text-primary" /> Notificações
                  </h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllAsRead}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      Ler todas
                    </button>
                  )}
                </div>
                <ScrollArea className="h-[300px]">
                  {notifications.length > 0 ? (
                    <div className="divide-y divide-border-subtle/50">
                      {notifications.map((n) => (
                        <div 
                          key={n.id} 
                          className={`p-4 hover:bg-surface transition-colors cursor-pointer group relative ${!n.read ? 'bg-primary/5' : ''}`}
                          onClick={() => {
                            if (!n.read) {
                              void handleMarkAsRead(n.id);
                            }
                            setNotificationsOpen(false);
                          }}
                        >
                          <div className="flex gap-3">
                            <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${!n.read ? 'bg-card shadow-sm' : 'bg-surface'}`}>
                              {getIconForType(n.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-bold leading-tight mb-1 ${!n.read ? 'text-text-main' : 'text-text-muted'}`}>
                                {n.title}
                              </p>
                              <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                                {n.message}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Clock size={10} className="text-text-muted/50" />
                                <span className="text-xs text-text-muted/60 font-medium">
                                  {n.createdAt?.seconds 
                                    ? formatDistanceToNow(new Date(n.createdAt.seconds * 1000), { addSuffix: true, locale: ptBR })
                                    : 'Agora'}
                                </span>
                              </div>
                            </div>
                          </div>
                          {n.link && (
                            <Link href={n.link} className="absolute inset-0 opacity-0 z-10" />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-10 text-center">
                      <Bell size={32} className="mx-auto text-text-muted/20 mb-3" />
                      <p className="text-xs text-text-muted font-medium">Sem novas notificações</p>
                    </div>
                  )}
                </ScrollArea>
                <div className="p-3 bg-surface border-t border-border-subtle text-center">
                  <Link
                    href="/admin/usuarios"
                    className="text-xs font-bold text-text-muted hover:text-primary flex items-center justify-center gap-1"
                    onClick={() => setNotificationsOpen(false)}
                  >
                    Ir para a área administrativa <ChevronRight size={10} />
                  </Link>
                </div>
                </div>
              )}
            </div>
            <ThemeToggle />
          </div>

          <div className="h-8 w-px bg-border-subtle mx-2 hidden sm:block" />

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-bold text-text-main">{profile?.name}</span>
              <span className="text-xs text-primary font-black uppercase tracking-normal">Administrator</span>
            </div>
            <Avatar className="w-9 h-9 border-2 border-primary/20">
              <AvatarImage src={user?.photoURL || ''} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">AD</AvatarFallback>
            </Avatar>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={logout}
              className="text-text-muted hover:text-red-500 rounded-full"
            >
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
