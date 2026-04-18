import type { Metadata } from 'next';
import './globals.css';
import { Inter, Outfit } from "next/font/google";
import { cn } from "@/lib/utils";
import { AuthProvider } from '@/hooks/use-auth';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-heading' });
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://skillsy.com.br';
const defaultDescription =
  'Conectando talentos e serviços na comunidade SUD. Uma plataforma 100% sem fins lucrativos para impulsionar o apoio mútuo.';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Skillsy | Rede de Apoio Comunitário SUD',
    template: '%s | Skillsy'
  },
  description: defaultDescription,
  keywords: ['SUD', 'comunidade', 'serviços', 'profissionais', 'apoio mútuo', 'talentos'],
  authors: [{ name: 'Skillsy Community' }],
  creator: 'Skillsy',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: '/',
    siteName: 'Skillsy',
    title: 'Skillsy | Rede de Apoio Comunitário SUD',
    description: defaultDescription,
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Skillsy - rede de apoio comunitário SUD',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Skillsy | Rede de Apoio Comunitário SUD',
    description: defaultDescription,
    images: ['/opengraph-image'],
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
import { ErrorBoundary } from "@/components/error-boundary";

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
          <ErrorBoundary>
            <AuthProvider>
              <TooltipProvider>
                {children}
                <Toaster position="top-center" richColors />
              </TooltipProvider>
            </AuthProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
