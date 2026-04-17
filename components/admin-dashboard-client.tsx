'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { UserService } from '@/services/user-service';
import { UserProfile } from '@/models/types';
import { 
  Users, 
  ShieldCheck, 
  Briefcase, 
  ArrowRight,
  Loader2,
  ShieldAlert
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';

export function AdminDashboardClient() {
  const { profile, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      if (profile?.role === 'admin') {
        setLoading(true);
        try {
          const allUsers = await UserService.getAllUsers();
          setUsers(allUsers);
        } catch (error) {
          console.error('Error fetching users:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchUsers();
  }, [profile]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-surface">
        <ShieldAlert size={64} className="text-red-500 mb-6" />
        <h1 className="text-3xl font-bold mb-4">Acesso Negado</h1>
        <p className="text-text-muted mb-8">Esta área é restrita a administradores do sistema.</p>
        <Link href="/">
          <Button className="bg-primary text-white font-bold rounded-xl px-8">Voltar para Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="pb-20 px-6 md:px-10 py-8 max-w-7xl mx-auto">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-text-main font-heading">Dashboard Administrativo</h2>
          <p className="text-text-muted mt-1">Visão geral do sistema e atalhos de gerenciamento.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="bg-card border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Total de Usuários</CardDescription>
              <CardTitle className="text-4xl font-bold font-heading">{loading ? '...' : users.length}</CardTitle>
            </CardHeader>
            <div className="h-1 bg-primary w-full opacity-20" />
          </Card>
          <Card className="bg-card border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Prestadores de Serviço</CardDescription>
              <CardTitle className="text-4xl font-bold font-heading">{loading ? '...' : users.filter(u => u.isProvider).length}</CardTitle>
            </CardHeader>
            <div className="h-1 bg-green-500 w-full opacity-20" />
          </Card>
          <Card className="bg-card border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Membros Verificados</CardDescription>
              <CardTitle className="text-4xl font-bold font-heading">{loading ? '...' : users.filter(u => u.verifiedMember).length}</CardTitle>
            </CardHeader>
            <div className="h-1 bg-amber-500 w-full opacity-20" />
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link href="/admin/usuarios">
              <Card className="group bg-card border border-border-subtle hover:border-primary/50 transition-all rounded-[2.5rem] p-8 cursor-pointer h-full">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Users size={28} />
                  </div>
                  <ArrowRight size={24} className="text-text-muted group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="text-xl font-bold mb-2 font-heading">Gerenciar Usuários</h3>
                <p className="text-text-muted text-sm leading-relaxed">
                  Visualize, edite, bloqueie ou verifique membros da plataforma. Filtre por localização, ala ou categoria.
                </p>
              </Card>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-card/50 border border-dashed border-border-subtle rounded-[2.5rem] p-8 h-full flex flex-col justify-center items-center text-center opacity-70">
              <div className="w-14 h-14 bg-surface rounded-2xl flex items-center justify-center text-text-muted mb-6">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2 font-heading">Relatórios (Em breve)</h3>
              <p className="text-text-muted text-sm leading-relaxed max-w-xs">
                Estatísticas detalhadas de crescimento, avaliações e interações na plataforma.
              </p>
            </Card>
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
  );
}
