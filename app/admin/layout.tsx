'use client';

import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { AdminNavbar } from '@/components/admin-navbar';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && (!profile || profile.role !== 'admin')) {
      const timer = setTimeout(() => {
        router.push('/');
      }, 3000); // Redirect after 3 seconds so they can see the message
      return () => clearTimeout(timer);
    }
  }, [profile, loading, router]);

  if (loading || !profile || profile.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-text-muted uppercase tracking-widest">
            {loading ? 'Carregando Painel...' : 'Redirecionando...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface/30">
      <AdminNavbar />
      <div className="max-w-[1600px] mx-auto">
        {children}
      </div>
    </div>
  );
}
