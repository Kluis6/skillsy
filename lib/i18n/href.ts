import { DEFAULT_LOCALE, type Locale } from '@skillsy/shared/i18n/locales';
import { localizedPath } from '@skillsy/shared/i18n/routing';

/** Link for a language: "/profile/1" stays as is in Portuguese and becomes
 * "/en/profile/1" in English. External links and anchors are kept. */
export function localizedHref(path: string, locale: Locale) {
  return localizedPath(path, locale, DEFAULT_LOCALE);
}
