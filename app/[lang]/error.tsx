"use client";

import { RouteError } from "@/components/route-error";
import { useT } from "@/lib/i18n/provider";

export default function RootError({
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
      title={t("errors.rootTitle")}
      description={t("errors.rootText")}
      backHref="/"
      backLabel={t("errors.rootBack")}
      fullScreen
    />
  );
}
