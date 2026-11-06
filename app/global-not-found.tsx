import type { Metadata } from 'next';
import './globals.css';
import { Inter, Outfit } from 'next/font/google';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { NotFoundPage } from '@/components/not-found-page';
import { headers } from 'next/headers';
import { HTML_LANG, isLocale, DEFAULT_LOCALE } from '@skillsy/shared/i18n/locales';
import { getTFor } from '@/lib/i18n/translator';

// The language comes from proxy.ts (x-skillsy-locale) for /en/... and /es/...
// URLs; anything else is Portuguese.
async function pageLocale() {
  const value = (await headers()).get('x-skillsy-locale');
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

// 404 for URLs no page matches (experimental.globalNotFound). The root
// layout lives in app/[lang], so this page brings its own <html>, styles,
// fonts and theme.
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-heading' });

export async function generateMetadata(): Promise<Metadata> {
  const t = getTFor(await pageLocale());
  return {
    title: `${t('errors.notFoundTitle')} | Skillsy`,
    robots: { index: false, follow: false },
  };
}

export default async function GlobalNotFound() {
  const locale = await pageLocale();
  const t = getTFor(locale);
  return (
    <html lang={HTML_LANG[locale]} className={cn('font-sans', inter.variable, outfit.variable)} suppressHydrationWarning>
      <body className="antialiased relative w-full min-h-screen" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NotFoundPage t={t} />
        </ThemeProvider>
      </body>
    </html>
  );
}
