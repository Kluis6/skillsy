import type { Metadata } from 'next';
import { TermsClient } from '@/components/terms-client';

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description: 'Entenda como a Skillsy funciona, os limites da plataforma e as responsabilidades de quem usa o serviço.',
};

export default function TermosPage() {
  return <TermsClient />;
}
