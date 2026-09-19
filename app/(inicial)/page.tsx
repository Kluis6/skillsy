import type { Metadata } from "next";
import { HomeClient } from "@/components/home-client";
import { createPublicMetadata } from "@/lib/public-metadata";
import { UserService } from "@/services/user-service";

export const dynamic = "force-dynamic";

const pageTitle = "Inicial";
const pageDescription =
  "Encontre profissionais e serviços de confiança na comunidade.";

export const metadata: Metadata = {
  ...createPublicMetadata({
    title: pageTitle,
    description: pageDescription,
    path: "/",
    imageTitle: "Onde talentos encontram oportunidades",
    imageDescription:
      "O Skillsy conecta membros, profissionais e negócios em uma rede onde indicação, confiança e propósito caminham juntos.",
    imageLabel: "Rede de confiança entre membros",
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

export default async function Home() {
  const initialProviders = await UserService.getProviders(6);

  return <HomeClient initialProviders={initialProviders} />;
}
