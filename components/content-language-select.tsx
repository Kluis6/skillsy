"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useT } from "@/lib/i18n/provider";
import { LOCALES, type Locale } from "@skillsy/shared/i18n/locales";

/** Language a profile, post or opportunity is written in. */
export function ContentLanguageSelect({
  id,
  value,
  onChange,
}: {
  id: string;
  value: Locale;
  onChange: (value: Locale) => void;
}) {
  const t = useT();
  const name = (locale: Locale) => t(`language.names.${locale}`);
  return (
    <Select value={value} onValueChange={(next) => next && onChange(next as Locale)}>
      <SelectTrigger id={id} className="h-10 w-full px-3 text-sm">
        <SelectValue>{name(value)}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {LOCALES.map((locale) => (
          <SelectItem key={locale} value={locale}>
            {name(locale)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
