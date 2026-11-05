import { AdminDashboardClient } from '@/components/admin-dashboard-client';
import { createPrivateMetadata } from '@/lib/public-metadata';

export const metadata = createPrivateMetadata({
  title: 'Painel Administrativo',
  description: 'Área restrita para gestão administrativa do Skillsy.',
});

export default function AdminPage() {
  return <AdminDashboardClient />;
}
