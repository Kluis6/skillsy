import type { Metadata } from 'next';
import './globals.css';
import { Inter, Outfit } from 'next/font/google';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { NotFoundPage } from '@/components/not-found-page';

// 404 for URLs no page matches (experimental.globalNotFound). The root
// layout lives in app/[lang], so this page brings its own <html>, styles,
// fonts and theme.
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-heading' });

export const metadata: Metadata = {
  title: 'Página não encontrada | Skillsy',
  robots: { index: false, follow: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="pt-BR" className={cn('font-sans', inter.variable, outfit.variable)} suppressHydrationWarning>
      <body className="antialiased relative w-full min-h-screen" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NotFoundPage />
        </ThemeProvider>
      </body>
    </html>
  );
}
