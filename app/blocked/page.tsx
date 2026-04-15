import { Metadata } from 'next';
import { BlockedClient } from '@/components/blocked-client';

export const metadata: Metadata = {
  title: 'Acesso Bloqueado',
  robots: {
    index: false,
    follow: false,
  },
};

export default function BlockedPage() {
  return <BlockedClient />;
}
