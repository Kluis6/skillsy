import { lang } from 'next/root-params';
import { DICTIONARIES, DEFAULT_LOCALE, INTL_LOCALE, isLocale, translate, type Locale } from '@skillsy/shared/i18n';
import type { MessageArea, TranslateFn } from '@skillsy/shared/i18n/keys';

// Texts in Server Components, metadata and server utilities. The language
// comes from the URL (app/[lang]) through next/root-params, so nothing has
// to be passed down. Client Components use useT() from ./provider.

export async function getLocale(): Promise<Locale> {
  const value = await lang();
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getT(): Promise<TranslateFn> {
  const locale = await getLocale();
  const messages = DICTIONARIES[locale];
  return (key, vars) => translate(messages, INTL_LOCALE[locale], key, vars);
}

/** The areas a client part needs, to hand to <I18nProvider>: only those go
 * to the browser. */
export async function getMessages(...areas: MessageArea[]) {
  const locale = await getLocale();
  const dictionary = DICTIONARIES[locale];
  return Object.fromEntries(areas.map((area) => [area, dictionary[area]]));
}
