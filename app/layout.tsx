import type { Metadata } from 'next';
import './globals.css';
import { Inter, Outfit } from "next/font/google";
import { cn } from "@/lib/utils";
import { AuthProvider } from '@/hooks/use-auth';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-heading' });

export const metadata: Metadata = {
  title: 'Skillsy | Network SUD',
  description: 'Conectando talentos e serviços na comunidade SUD.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={cn("font-sans", inter.variable, outfit.variable)}>
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
