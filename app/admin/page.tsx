import { Metadata } from 'next';
import { AdminDashboardClient } from '@/components/admin-dashboard-client';

export const metadata: Metadata = {
  title: 'Painel Administrativo',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return <AdminDashboardClient />;
}
