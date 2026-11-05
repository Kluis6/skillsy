"use client";

import { Badge } from "@/components/ui/badge";
import { useLocale, useT } from "@/lib/i18n/provider";
import { contentLanguage } from "@skillsy/shared/i18n/origin";
import type { MessageKey } from "@skillsy/shared/i18n/keys";
import { cn } from "@/lib/utils";

/** Shows the language a profile, post or opportunity is written in, only when
 * it differs from the page's language ("PT" on an English page). */
export function LanguageBadge({
  item,
  className,
}: {
  item: { language?: string | null };
  className?: string;
}) {
  const t = useT();
  const locale = useLocale();
  const language = contentLanguage(item);
  if (language === locale) return null;
  const name = t(`language.names.${language}` as MessageKey);

  return (
    <Badge
      variant="outline"
      title={t("language.writtenIn", { language: name })}
      aria-label={t("language.writtenIn", { language: name })}
      className={cn("px-1.5 text-[10px] font-bold uppercase tracking-wide", className)}
    >
      {language}
    </Badge>
  );
}
