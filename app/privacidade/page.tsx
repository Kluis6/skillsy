import { Metadata } from 'next';
import { PrivacyClient } from '@/components/privacy-client';

export const metadata: Metadata = {
  title: 'Política de Privacidade | Skillsy',
  description: 'Saiba como protegemos seus dados na plataforma Skillsy.',
};

export default function PrivacidadePage() {
  return <PrivacyClient />;
}
