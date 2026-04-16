'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  LogOut, 
  Home,
  Settings,
  Bell
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export function AdminNavbar() {
  const { user, profile, logout } = useAuth();

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
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Admin Panel</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1 bg-surface rounded-xl p-1 border border-border-subtle">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="rounded-lg gap-2 font-bold text-xs h-9 px-4 bg-card shadow-sm">
                <LayoutDashboard size={14} /> Dashboard
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="ghost" size="sm" className="rounded-lg gap-2 font-bold text-xs h-9 px-4 text-text-muted hover:text-primary">
                <Users size={14} /> Usuários
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm" className="rounded-lg gap-2 font-bold text-xs h-9 px-4 text-text-muted hover:text-primary">
                <Home size={14} /> Ver Site
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 mr-2">
            <Button variant="ghost" size="icon" className="rounded-full text-text-muted hover:text-primary">
              <Bell size={18} />
            </Button>
            <ThemeToggle />
          </div>

          <div className="h-8 w-px bg-border-subtle mx-2 hidden sm:block" />

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-bold text-text-main">{profile?.name}</span>
              <span className="text-[9px] text-primary font-black uppercase tracking-widest">Administrator</span>
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
