import type { Metadata } from "next";
import "../globals.css";
import { Inter, Outfit } from "next/font/google";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/hooks/use-auth";
import { getPublicBaseUrl } from "@/lib/public-metadata";
import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import { HTML_LANG, enabledLocales, isLocale } from "@skillsy/shared/i18n/locales";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});
const outfit = Outfit({ subsets: ["latin"], variable: "--font-heading" });
const baseUrl = getPublicBaseUrl();
const defaultDescription =
  "Conectando talentos e serviços na comunidade de membros. Uma plataforma para impulsionar pessoas.";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Skillsy | Network entre membros",
    template: "%s | Skillsy",
  },
  description: defaultDescription,
  keywords: [
    "SUD",
    "comunidade",
    "serviços",
    "profissionais",
    "membros para membros",
    "talentos",
  ],
  authors: [{ name: "Skillsy Community" }],
  creator: "Skillsy",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/apple-icon.svg",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: "Skillsy",
    title: "Skillsy | Network entre membros",
    description: defaultDescription,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Skillsy - Network entre membros",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Skillsy | Network entre membros",
    description: defaultDescription,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import { TermsUpdateDialog } from "@/components/terms-update-dialog";

import { ThemeProvider } from "@/components/theme-provider";
import { ErrorBoundary } from "@/components/error-boundary";

// One static version per enabled language (docs/i18n-plan.md). proxy.ts
// keeps the disabled ones out; the check below covers direct hits.
const ENABLED = enabledLocales(process.env.NEXT_PUBLIC_ENABLED_LOCALES);

export function generateStaticParams() {
  return ENABLED.map((locale) => ({ lang: locale }));
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await lang();
  if (!isLocale(locale) || !ENABLED.includes(locale)) notFound();

  return (
    <html
      lang={HTML_LANG[locale]}
      className={cn("font-sans", inter.variable, outfit.variable)}
      suppressHydrationWarning
    >
      <body
        className="antialiased transition-colors duration-300 relative w-full min-h-screen"
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <AuthProvider>
              <TooltipProvider>
                {children}
                <CookieConsentBanner />
                <TermsUpdateDialog />
                <Toaster position="top-center" richColors />
              </TooltipProvider>
            </AuthProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
