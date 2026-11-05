"use client";

import { RouteError } from "@/components/route-error";
import { useT } from "@/lib/i18n/provider";

export default function SearchError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const t = useT();
  return (
    <RouteError
      error={error}
      retry={retry}
      title={t("errors.searchTitle")}
      description={t("errors.searchText")}
      backHref="/search"
      backLabel={t("errors.searchBack")}
    />
  );
}
