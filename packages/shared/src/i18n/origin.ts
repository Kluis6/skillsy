// Where content comes from (docs/i18n-plan.md, decided 05/11/2026): the
// country filters, the page's language orders. Documents without the fields
// are Brazilian Portuguese, so nothing had to be migrated. No imports, so
// tests run it with plain Node.

export const DEFAULT_COUNTRY = "BR";
export const DEFAULT_CONTENT_LANGUAGE = "pt";

type WithOrigin = { language?: string | null; country?: string | null };

export const contentLanguage = (item: WithOrigin) => item.language || DEFAULT_CONTENT_LANGUAGE;
export const contentCountry = (item: WithOrigin) => item.country || DEFAULT_COUNTRY;

/**
 * Only content from `country`, with what is written in `language` first.
 * Within each group the original order is kept (Array.prototype.sort is
 * stable), so rankings such as recommendations or urgency still apply.
 */
export function byOrigin<T extends WithOrigin>(
  items: T[],
  { language, country = DEFAULT_COUNTRY }: { language: string; country?: string },
): T[] {
  return items
    .filter((item) => contentCountry(item) === country)
    .sort((a, b) => Number(contentLanguage(b) === language) - Number(contentLanguage(a) === language));
}
