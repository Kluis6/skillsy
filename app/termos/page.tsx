import type { Metadata } from 'next';
import { TermsClient } from '@/components/terms-client';

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description: 'Leia os termos de uso e responsabilidades da plataforma Skillsy.',
};

export default function TermosPage() {
  return <TermsClient />;
}
