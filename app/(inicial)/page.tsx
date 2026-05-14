import type { Metadata } from 'next';
import { HomeClient } from '@/components/home-client';
import { UserService } from '@/services/user-service';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://skillsy.com.br';
const pageTitle = 'Inicial';
const pageDescription =
  'Encontre profissionais e serviços de confiança na comunidade.';
const socialImage = `${baseUrl}/opengraph-image`;

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: [
    'skillsy',
    'rede de confiança',
    'comunidade ',
    'profissionais ',
    'serviços',
    'apoio mútuo',
    'prestadores de serviço',
    'indicações confiáveis',
  ],
  alternates: {
    canonical: '/',
  },
  category: 'community platform',
  classification: 'marketpĺace de serviços e diretório de profissionais',
  referrer: 'origin-when-cross-origin',
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: baseUrl,
    siteName: 'Skillsy',
    title: pageTitle,
    description: pageDescription,
    images: [
      {
        url: socialImage,
        width: 1200,
        height: 630,
        alt: 'Skillsy, rede de apoio a profissionais e serviços de confiança',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: pageTitle,
    description: pageDescription,
    images: [socialImage],
  },
};

export default async function Home() {
  const initialProviders = await UserService.getProviders(6);
  
  return <HomeClient initialProviders={initialProviders} />;
}
