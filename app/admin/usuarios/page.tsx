import { AdminUsersClient } from '@/components/admin-users-client';
import { createPrivateMetadata } from '@/lib/public-metadata';

export const metadata = createPrivateMetadata({
  title: 'Gerenciar Usuários | Painel Administrativo',
  description: 'Área restrita para gerenciar usuários do Skillsy.',
});

export default function AdminUsersPage() {
  return <AdminUsersClient />;
}
