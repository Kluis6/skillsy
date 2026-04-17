import { Metadata } from 'next';
import { AdminUsersClient } from '@/components/admin-users-client';

export const metadata: Metadata = {
  title: 'Gerenciar Usuários | Painel Administrativo',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminUsersPage() {
  return <AdminUsersClient />;
}
