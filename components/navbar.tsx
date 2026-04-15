'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Menu, 
  Search, 
  Users, 
  ShieldCheck, 
  Settings, 
  Heart, 
  LogOut, 
  User as UserIcon 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from '@/components/theme-toggle';
import { AuthModal } from '@/components/auth-modal';
import { toast } from "sonner";
import { UserProfile } from '@/models/types';
import { User } from 'firebase/auth';

interface NavbarProps {
  user: User | null;
  profile: UserProfile | null;
  logout: () => Promise<void>;
  activeTab: 'explore' | 'contacts';
  setActiveTab: (tab: 'explore' | 'contacts') => void;
}

export function Navbar({ user, profile, logout, activeTab, setActiveTab }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border-subtle px-6 md:px-10 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="text-text-main hover:bg-surface rounded-full transition-all duration-300">
                  <Menu size={24} />
                </Button>
              }
            />
            <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-background p-0 border-r border-border-subtle">
              <div className="flex flex-col h-full">
                <SheetHeader className="p-8 text-left bg-surface/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-2xl">S</span>
                    </div>
                    <SheetTitle className="text-2xl font-bold text-text-main">Skillsy</SheetTitle>
                  </div>
                  <SheetDescription className="text-text-muted font-medium">
                    Sua rede de confiança e talentos.
                  </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto py-6">
                  {user ? (
                    <div className="px-6 mb-8">
                      <div className="flex items-center gap-4 p-4 bg-surface rounded-2xl border border-primary/5">
                        <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                          <AvatarImage src={user.photoURL || ''} />
                          <AvatarFallback className="bg-primary text-white font-bold">{profile?.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-bold text-text-main">{profile?.name}</span>
                          <span className="text-xs text-text-muted">{user.email}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="px-6 mb-8">
                      <AuthModal>
                        <Button className="w-full bg-primary text-white font-bold h-12 rounded-xl shadow-lg shadow-primary/10">
                          Entrar na Conta
                        </Button>
                      </AuthModal>
                    </div>
                  )}

                  <div className="px-4 space-y-1">
                    <h4 className="px-4 text-[10px] font-bold uppercase tracking-widest text-text-muted/60 mb-2">Navegação</h4>
                    <Button 
                      variant="ghost" 
                      className={`w-full justify-start gap-3 h-12 rounded-xl font-semibold ${activeTab === 'explore' ? 'bg-surface text-primary' : 'text-text-muted hover:text-primary hover:bg-surface/50'}`}
                      onClick={() => setActiveTab('explore')}
                    >
                      <Search size={18} /> Explorar Membros
                    </Button>
                    
                    {user && (
                      <Link href="/contacts">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start gap-3 h-12 rounded-xl font-semibold text-text-muted hover:text-primary hover:bg-surface/50"
                        >
                          <Users size={18} /> Meus Contatos
                        </Button>
                      </Link>
                    )}
                  </div>

                  <Separator className="my-6 mx-8 w-auto bg-border-subtle/50" />

                  <div className="px-4 space-y-1">
                    <h4 className="px-4 text-[10px] font-bold uppercase tracking-widest text-text-muted/60 mb-2">Conta</h4>
                    {profile?.role === 'admin' && (
                      <Link href="/admin">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start gap-3 h-12 rounded-xl font-bold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/10 mb-2"
                        >
                          <ShieldCheck size={18} /> Painel Admin
                        </Button>
                      </Link>
                    )}
                    <Link href="/profile">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start gap-3 h-12 rounded-xl font-semibold text-text-muted hover:text-primary hover:bg-surface/50"
                      >
                        <Settings size={18} /> Configurações do Perfil
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-3 h-12 rounded-xl font-semibold text-text-muted hover:text-primary hover:bg-surface/50"
                      onClick={() => toast.info('Funcionalidade de Doação', {
                        description: 'Esta plataforma é sem fins lucrativos. Em breve você poderá apoiar a manutenção do projeto.'
                      })}
                    >
                      <Heart size={18} className="text-red-500" /> Doar para o Projeto
                    </Button>
                  </div>
                </div>

                {user && (
                  <div className="p-6 border-t border-border-subtle bg-surface/10">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-3 h-12 rounded-xl font-bold text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={logout}
                    >
                      <LogOut size={18} /> Sair da Conta
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-text-main">
              Skillsy
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-8">
          <ul className="hidden md:flex items-center gap-8 text-sm font-semibold text-text-muted">
            <li 
              onClick={() => setActiveTab('explore')}
              className={`cursor-pointer transition-all ${activeTab === 'explore' ? 'text-primary' : 'hover:text-primary'}`}
            >
              Explorar
            </li>
            {user && (
              <li 
                onClick={() => setActiveTab('contacts')}
                className={`cursor-pointer transition-all ${activeTab === 'contacts' ? 'text-primary' : 'hover:text-primary'}`}
              >
                Contatos
              </li>
            )}
          </ul>

          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-bold text-text-main">{profile?.name}</span>
                {profile?.role === 'admin' && <span className="text-[10px] text-accent font-bold uppercase">Admin</span>}
              </div>
              <Avatar className="w-9 h-9 border border-border-subtle">
                <AvatarImage src={user.photoURL || ''} />
                <AvatarFallback><UserIcon size={18} /></AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="sm" onClick={logout} className="text-text-muted hover:text-primary font-bold">
                Sair
              </Button>
            </div>
          ) : (
            <AuthModal>
              <Button className="bg-primary text-white hover:bg-primary/90 rounded-full px-6 font-bold shadow-lg shadow-primary/20">
                Entrar
              </Button>
            </AuthModal>
          )}
        </div>
      </div>
    </nav>
  );
}
