import type { Metadata } from 'next';
import './globals.css';
import { Inter, Outfit } from "next/font/google";
import { cn } from "@/lib/utils";
import { AuthProvider } from '@/hooks/use-auth';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-heading' });

export const metadata: Metadata = {
  title: {
    default: 'Skillsy | Rede de Apoio Comunitário SUD',
    template: '%s | Skillsy'
  },
  description: 'Conectando talentos e serviços na comunidade SUD. Uma plataforma 100% sem fins lucrativos para impulsionar o apoio mútuo.',
  keywords: ['SUD', 'comunidade', 'serviços', 'profissionais', 'apoio mútuo', 'talentos'],
  authors: [{ name: 'Skillsy Community' }],
  creator: 'Skillsy',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://skillsy.com.br',
    siteName: 'Skillsy',
    title: 'Skillsy | Rede de Apoio Comunitário SUD',
    description: 'Conectando talentos e serviços na comunidade SUD. Uma plataforma 100% sem fins lucrativos.',
    images: [
      {
        url: 'https://picsum.photos/seed/skillsy-og/1200/630',
        width: 1200,
        height: 630,
        alt: 'Skillsy Community Network',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Skillsy | Rede de Apoio Comunitário SUD',
    description: 'Conectando talentos e serviços na comunidade SUD.',
    images: ['https://picsum.photos/seed/skillsy-twitter/1200/630'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={cn("font-sans", inter.variable, outfit.variable)} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <TooltipProvider>
              {children}
              <Toaster position="top-center" richColors />
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
