import { Metadata } from "next";
import { SearchClient } from "@/components/search-client";
import { createPublicMetadata } from "@/lib/public-metadata";
import { UserService } from "@/services/user-service";
import { UserProfile } from "@/models/types";

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

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    city?: string;
    state?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() || "";
  const city = params.city?.trim() || "";
  const state = params.state?.trim() || "";
  const location = city || state ? { city, state } : undefined;

  const results = await UserService.searchProviders(query, location);

  let suggestions: UserProfile[] = [];

  if (results.length === 0 && location) {
    const suggestedData = await UserService.searchProviders("", location);
    suggestions = suggestedData.slice(0, 3);
  } else if (results.length === 0) {
    suggestions = await UserService.getProviders(3);
  }

  return (
    <SearchClient
      initialQuery={query}
      initialCity={city}
      initialState={state}
      initialResults={results}
      initialSuggestions={suggestions}
    />
  );
}
