import { DICTIONARIES, DEFAULT_LOCALE, INTL_LOCALE, isLocale, translate } from '@skillsy/shared/i18n';
import type { TranslateFn } from '@skillsy/shared/i18n/keys';

/**
 * t() for a language given explicitly. Image routes (opengraph-image) get the
 * language from their `params`; next/root-params is not available there.
 */
export function getTFor(value: unknown): TranslateFn {
  const locale = isLocale(value) ? value : DEFAULT_LOCALE;
  const messages = DICTIONARIES[locale];
  return (key, vars) => translate(messages, INTL_LOCALE[locale], key, vars);
}
