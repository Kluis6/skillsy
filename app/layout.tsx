import type { Metadata } from "next";
import "./globals.css";
import { Inter, Outfit } from "next/font/google";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/hooks/use-auth";
import { getPublicBaseUrl } from "@/lib/public-metadata";

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

import { ThemeProvider } from "@/components/theme-provider";
import { ErrorBoundary } from "@/components/error-boundary";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
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
                <Toaster position="top-center" richColors />
              </TooltipProvider>
            </AuthProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
