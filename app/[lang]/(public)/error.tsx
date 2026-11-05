"use client";

import { RouteError } from "@/components/route-error";
import { useT } from "@/lib/i18n/provider";

export default function PublicError({
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
      title={t("errors.publicTitle")}
      description={t("errors.publicText")}
      backHref="/"
      backLabel={t("errors.publicBack")}
    />
  );
}
