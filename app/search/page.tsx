import { Metadata } from 'next';
import { SearchClient } from '@/components/search-client';

export const metadata: Metadata = {
  title: 'Busca de Profissionais',
  description: 'Encontre os melhores profissionais e serviços na comunidade SUD. Resultados personalizados por localização e categoria.',
  openGraph: {
    title: 'Busca de Profissionais | Skillsy',
    description: 'Encontre os melhores profissionais e serviços na comunidade SUD.',
  },
};

export default function SearchPage() {
  return <SearchClient />;
}
