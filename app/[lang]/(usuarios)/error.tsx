"use client";

import { RouteError } from "@/components/route-error";
import { useT } from "@/lib/i18n/provider";

export default function ProfileError({
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
      title={t("errors.profileTitle")}
      description={t("errors.profileText")}
      backHref="/search"
      backLabel={t("errors.profileBack")}
    />
  );
}
