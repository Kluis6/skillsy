"use client";

import { RouteError } from "@/components/route-error";
import { useT } from "@/lib/i18n/provider";

export default function MyPostsError({
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
      title={t("errors.myPostsTitle")}
      description={t("errors.myPostsText")}
      backHref="/meus-artigos"
      backLabel={t("errors.myPostsBack")}
    />
  );
}
