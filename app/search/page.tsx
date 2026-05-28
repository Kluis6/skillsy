import { Metadata } from "next";
import { SearchClient } from "@/components/search-client";
import { createPublicMetadata } from "@/lib/public-metadata";

export const metadata: Metadata = createPublicMetadata({
  title: "Busca de Profissionais",
  description:
    "Encontre os melhores profissionais e serviços na comunidade. Resultados personalizados por localização e categoria.",
  path: "/search",
  imageTitle: "Busque profissionais com mais contexto",
  imageDescription:
    "Compartilhe resultados e descubra serviços por localização, categoria e confiança da comunidade.",
  imageLabel: "Busca pública",
  socialImagePath: "/search/opengraph-image",
});

export default function SearchPage() {
  return <SearchClient />;
}
