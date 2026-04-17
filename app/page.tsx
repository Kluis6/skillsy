import { Metadata } from 'next';
import { HomeClient } from '@/components/home-client';
import { UserService } from '@/services/user-service';

export const metadata: Metadata = {
  title: 'Home | Skillsy - Sua Rede de Confiança SUD',
  description: 'Encontre profissionais e serviços de confiança na comunidade SUD. Uma rede de apoio mútuo 100% sem fins lucrativos.',
  openGraph: {
    title: 'Home | Skillsy - Sua Rede de Confiança SUD',
    description: 'Encontre profissionais e serviços de confiança na comunidade SUD.',
  },
};

export default async function Home() {
  const initialProviders = await UserService.getProviders(6);
  
  return <HomeClient initialProviders={initialProviders} />;
}
