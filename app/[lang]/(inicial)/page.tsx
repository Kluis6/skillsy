import type { Metadata } from "next";
import { HomeClient } from "@/components/home-client";
import { createPublicMetadata, withoutWard } from "@/lib/public-metadata";
import { UserService } from "@/services/user-service";
import { getLocale, getMessages, getT } from "@/lib/i18n/server";
import { byOrigin } from "@skillsy/shared/i18n/origin";
import { I18nProvider } from "@/lib/i18n/provider";

// Public data, regenerated at most once an hour (ISR) instead of querying
// Firestore on every visit. Personal and realtime parts load on the client.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();

  return {
    ...createPublicMetadata({
      title: t("home.metaTitle"),
      description: t("home.metaDescription"),
      path: "/",
      imageTitle: t("common.slogan"),
      imageDescription: t("home.imageDescription"),
      imageLabel: t("home.imageLabel"),
      heroImage: "home",
      keywords: [
        "skillsy",
        "rede de confiança",
        "comunidade",
        "profissionais",
        "serviços",
        "apoio mútuo",
        "prestadores de serviço",
        "indicações confiáveis",
      ],
    }),
    category: "community platform",
    classification: "marketplace de serviços e diretório de profissionais",
    referrer: "origin-when-cross-origin",
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export default async function Home() {
  const [providers, messages, locale] = await Promise.all([
    UserService.getProviders(6),
    getMessages("home", "contact"),
    getLocale(),
  ]);
  // Professionals from the visitor's country, in the page's language first.
  const initialProviders = byOrigin(providers, { language: locale }).map(withoutWard);

  return (
    <I18nProvider messages={messages}>
      <HomeClient initialProviders={initialProviders} />
    </I18nProvider>
  );
}
