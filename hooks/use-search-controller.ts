import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { UserService } from "@/services/user-service";
import { UserProfile } from "@/models/types";
import { useLocale } from "@/lib/i18n/provider";
import { useLabels } from "@/lib/i18n/labels";
import { buildSearchSynonyms } from "@skillsy/shared/i18n/search-synonyms";
import { byOrigin } from "@skillsy/shared/i18n/origin";

export function useSearchController(initialProviders: UserProfile[] = []) {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState<{
    city: string;
    state: string;
  } | null>(null);
  const [providers, setProviders] = useState<UserProfile[]>(initialProviders);
  const [searching, setSearching] = useState(false);
  const searchRequestId = useRef(0);
  const locale = useLocale();
  const labels = useLabels();
  // Results from the visitor's country, in the page's language first; other
  // languages' words also search the Portuguese ones.
  const synonyms = useMemo(() => buildSearchSynonyms(locale, labels.category), [locale, labels]);
  const arrange = useCallback(
    (items: UserProfile[]) => byOrigin(items, { language: locale }),
    [locale],
  );

  const fetchInitialProviders = useCallback(async () => {
    try {
      const data = await UserService.getProviders(6);
      setProviders(arrange(data));
    } catch (error) {
      console.error("Error fetching initial providers:", error);
    }
  }, [arrange]);

  const handleSearch = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();

      setSearching(true);
      try {
        const filtered = await UserService.searchProviders(
          searchTerm,
          locationFilter || undefined,
          undefined,
          synonyms,
        );
        setProviders(arrange(filtered));
      } catch (error) {
        console.error("Error searching:", error);
      } finally {
        setSearching(false);
      }
    },
    [searchTerm, locationFilter, synonyms, arrange],
  );

  useEffect(() => {
    let isMounted = true;
    const requestId = ++searchRequestId.current;

    const performSearch = async () => {
      // If we have initialProviders and no filters are active, skip search
      if (!locationFilter && !searchTerm && initialProviders.length > 0) {
        return;
      }

      if (!locationFilter && !searchTerm && initialProviders.length === 0) {
        setSearching(true);
        try {
          const featuredProviders = await UserService.getProviders(6);
          if (isMounted && requestId === searchRequestId.current) {
            setProviders(arrange(featuredProviders));
          }
        } catch (error) {
          console.error("Error fetching featured providers:", error);
        } finally {
          if (isMounted && requestId === searchRequestId.current) {
            setSearching(false);
          }
        }
        return;
      }

      if (locationFilter || searchTerm) {
        setSearching(true);
        try {
          const filtered = await UserService.searchProviders(
            searchTerm,
            locationFilter || undefined,
            undefined,
            synonyms,
          );
          if (isMounted && requestId === searchRequestId.current) {
            setProviders(arrange(filtered));
          }
        } catch (error) {
          console.error("Error searching:", error);
        } finally {
          if (isMounted && requestId === searchRequestId.current) {
            setSearching(false);
          }
        }
      }
    };

    const debounceTimer = window.setTimeout(performSearch, 300);

    return () => {
      isMounted = false;
      window.clearTimeout(debounceTimer);
    };
  }, [locationFilter, searchTerm, initialProviders.length, synonyms, arrange]);

  return {
    searchTerm,
    setSearchTerm,
    locationFilter,
    setLocationFilter,
    providers,
    searching,
    handleSearch,
    fetchInitialProviders,
  };
}
