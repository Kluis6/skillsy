import { BlockedClient } from '@/components/blocked-client';
import { createPrivateMetadata } from '@/lib/public-metadata';

export const metadata = createPrivateMetadata({
  title: 'Acesso Bloqueado',
  description: 'Página de aviso para acesso bloqueado no Skillsy.',
});

export default function BlockedPage() {
  return <BlockedClient />;
}
