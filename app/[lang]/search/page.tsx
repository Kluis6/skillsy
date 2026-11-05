import { Metadata } from "next";
import { SearchClient } from "@/components/search-client";
import { createPublicMetadata } from "@/lib/public-metadata";
import { UserService } from "@/services/user-service";
import { UserProfile } from "@/models/types";
import { getMessages, getT } from "@/lib/i18n/server";
import { I18nProvider } from "@/lib/i18n/provider";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return createPublicMetadata({
    title: t("search.metaTitle"),
    description: t("search.metaDescription"),
    path: "/search",
    imageTitle: t("search.imageTitle"),
    imageDescription: t("search.imageDescription"),
    imageLabel: t("search.imageLabel"),
  });
}

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    city?: string;
    state?: string;
    category?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() || "";
  const city = params.city?.trim() || "";
  const state = params.state?.trim() || "";
  const category = params.category?.trim() || "";
  const location = city || state ? { city, state } : undefined;

  const results = await UserService.searchProviders(query, location, category || undefined);

  let suggestions: UserProfile[] = [];

  if (results.length === 0 && location) {
    const suggestedData = await UserService.searchProviders("", location, category || undefined);
    suggestions = suggestedData.slice(0, 3);
  } else if (results.length === 0) {
    suggestions = await UserService.getProviders(3);
  }

  return (
    <I18nProvider messages={await getMessages("search")}>
      <SearchClient
        initialQuery={query}
        initialCity={city}
        initialState={state}
        initialCategory={category}
        initialResults={results}
        initialSuggestions={suggestions}
      />
    </I18nProvider>
  );
}
