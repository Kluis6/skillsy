import type { Metadata } from 'next';
import { PrivacyClient } from '@/components/privacy-client';

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Entenda quais dados a Skillsy trata, como eles são usados e quais direitos você pode exercer em relação à sua privacidade.',
};

export default function PrivacidadePage() {
  return <PrivacyClient />;
}
