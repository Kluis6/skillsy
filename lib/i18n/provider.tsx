'use client';

import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { DEFAULT_LOCALE, INTL_LOCALE, translate, type Locale, type Messages } from '@skillsy/shared/i18n';
import type { TranslateFn } from '@skillsy/shared/i18n/keys';
import { localizedHref } from './href';

// Texts in Client Components. The root layout hands over the areas every page
// uses (common, nav, footer…); a page with heavier client parts wraps them in
// another <I18nProvider> with its own areas, merged with the parent's.

type I18nContextValue = { locale: Locale; messages: Messages };

const I18nContext = createContext<I18nContextValue>({ locale: DEFAULT_LOCALE, messages: {} });

export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale?: Locale;
  messages: Messages;
  children: ReactNode;
}) {
  const parent = useContext(I18nContext);
  const value = useMemo(
    () => ({ locale: locale ?? parent.locale, messages: { ...parent.messages, ...messages } }),
    [locale, messages, parent],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useLocale() {
  return useContext(I18nContext).locale;
}

export function useT(): TranslateFn {
  const { locale, messages } = useContext(I18nContext);
  return useCallback<TranslateFn>(
    (key, vars) => {
      const text = translate(messages, INTL_LOCALE[locale], key, vars);
      if (text === key && process.env.NODE_ENV !== 'production') {
        console.warn(`[i18n] "${key}" não está nas áreas entregues a este componente (I18nProvider).`);
      }
      return text;
    },
    [locale, messages],
  );
}

/** localizedHref for the current language: "/profile/1" → "/en/profile/1". */
export function useHref() {
  const locale = useLocale();
  return useCallback((path: string) => localizedHref(path, locale), [locale]);
}
