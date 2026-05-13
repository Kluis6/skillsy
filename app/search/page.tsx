import { Metadata } from 'next';
import { SearchClient } from '@/components/search-client';

export const metadata: Metadata = {
  title: 'Busca de Profissionais',
  description: 'Encontre os melhores profissionais e serviços na comunidade. Resultados personalizados por localização e categoria.',
  openGraph: {
    title: 'Busca de Profissionais | Skillsy',
    description: 'Encontre os melhores profissionais e serviços na comunidade.',
  },
};

export default function SearchPage() {
  return <SearchClient />;
}
