import { Metadata } from 'next';
import { AdminClient } from '@/components/admin-client';

export const metadata: Metadata = {
  title: 'Painel Administrativo',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return <AdminClient />;
}
