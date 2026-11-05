"use client";

import { RouteError } from "@/components/route-error";
import { useT } from "@/lib/i18n/provider";

export default function ContactsError({
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
      title={t("errors.contactsTitle")}
      description={t("errors.contactsText")}
      backHref="/"
      backLabel={t("errors.contactsBack")}
    />
  );
}
