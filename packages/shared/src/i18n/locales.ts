// Languages of the site and the app (docs/i18n-plan.md). Portuguese is the
// default and has no URL prefix; English and Spanish live under /en and /es.

export const LOCALES = ["pt", "en", "es"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "pt";

/** `<html lang>` and hreflang values. Spanish is Latin American (es-419). */
export const HTML_LANG: Record<Locale, string> = { pt: "pt-BR", en: "en", es: "es-419" };

/** Open Graph `og:locale`. */
export const OG_LOCALE: Record<Locale, string> = { pt: "pt_BR", en: "en_US", es: "es_LA" };

/** Intl formatting (dates, numbers, plurals). */
export const INTL_LOCALE: Record<Locale, string> = { pt: "pt-BR", en: "en-US", es: "es-419" };

/** Name of each language in itself, for the language switcher. */
export const LOCALE_NAMES: Record<Locale, string> = { pt: "Português", en: "English", es: "Español" };

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Languages switched on for visitors. The code ships with only Portuguese
 * on (NEXT_PUBLIC_ENABLED_LOCALES=pt); English and Spanish go live together
 * after the review. Portuguese is always on. */
export function enabledLocales(raw: string | undefined): Locale[] {
  const listed = (raw ?? DEFAULT_LOCALE).split(",").map((value) => value.trim());
  const locales = LOCALES.filter((locale) => listed.includes(locale));
  return locales.includes(DEFAULT_LOCALE) ? locales : [DEFAULT_LOCALE, ...locales];
}
