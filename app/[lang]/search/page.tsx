import { Metadata } from "next";
import { SearchClient } from "@/components/search-client";
import { createPublicMetadata, withoutWard } from "@/lib/public-metadata";
import { UserService } from "@/services/user-service";
import { UserProfile } from "@/models/types";
import { getLocale, getMessages, getSearchSynonyms, getT } from "@/lib/i18n/server";
import { byOrigin } from "@skillsy/shared/i18n/origin";
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

  const [locale, synonyms] = await Promise.all([getLocale(), getSearchSynonyms()]);
  // Professionals from the visitor's country, in the page's language first.
  const origin = { language: locale };
  const results = byOrigin(
    await UserService.searchProviders(query, location, category || undefined, synonyms),
    origin,
  );

  let suggestions: UserProfile[] = [];

  if (results.length === 0 && location) {
    const suggestedData = await UserService.searchProviders("", location, category || undefined);
    suggestions = byOrigin(suggestedData, origin).slice(0, 3);
  } else if (results.length === 0) {
    suggestions = byOrigin(await UserService.getProviders(3), origin);
  }

  return (
    <I18nProvider messages={await getMessages("search")}>
      <SearchClient
        initialQuery={query}
        initialCity={city}
        initialState={state}
        initialCategory={category}
        initialResults={results.map(withoutWard)}
        initialSuggestions={suggestions.map(withoutWard)}
      />
    </I18nProvider>
  );
}
