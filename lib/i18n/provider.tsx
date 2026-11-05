'use client';

import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { DEFAULT_LOCALE, INTL_LOCALE, translate, type Locale, type Messages } from '@skillsy/shared/i18n';
import type { TranslateFn } from '@skillsy/shared/i18n/keys';
import { localizedHref } from './href';

// Texts in Client Components. The root layout hands over the areas every page
// uses (common, nav, footer…); a page with heavier client parts wraps them in
// another <I18nProvider> with its own areas, merged with the parent's.

type I18nContextValue = {
  locale: Locale;
  messages: Messages;
  /** Portuguese validation messages (pt.json "validation"): the shared zod
   * schemas, also used by the app, return these texts. */
  validationSource: Record<string, string>;
};

const I18nContext = createContext<I18nContextValue>({
  locale: DEFAULT_LOCALE,
  messages: {},
  validationSource: {},
});

export function I18nProvider({
  locale,
  messages,
  validationSource,
  children,
}: {
  locale?: Locale;
  messages: Messages;
  validationSource?: Record<string, string>;
  children: ReactNode;
}) {
  const parent = useContext(I18nContext);
  const value = useMemo(
    () => ({
      locale: locale ?? parent.locale,
      messages: { ...parent.messages, ...messages },
      validationSource: validationSource ?? parent.validationSource,
    }),
    [locale, messages, validationSource, parent],
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

/**
 * Translates a validation message from the shared zod schemas. They return
 * Portuguese text (the app shows it as is until it gets translations), so the
 * text is looked up in pt.json "validation" — templates included, like
 * "Ano deve estar entre 1830 e {year}" — and shown in the page's language.
 * Unknown messages are shown unchanged.
 */
export function useValidationMessage() {
  const { locale, messages, validationSource } = useContext(I18nContext);
  const patterns = useMemo(
    () =>
      Object.entries(validationSource).map(([key, text]) => {
        const names = [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]);
        const pattern = text
          .split(/\{\w+\}/)
          .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
          .join('(.+?)');
        return { key, names, regex: new RegExp(`^${pattern}$`) };
      }),
    [validationSource],
  );
  return useCallback(
    (message?: string) => {
      if (!message) return '';
      for (const { key, names, regex } of patterns) {
        const match = regex.exec(message);
        if (!match) continue;
        const vars = Object.fromEntries(names.map((name, index) => [name, match[index + 1]]));
        return translate(messages, INTL_LOCALE[locale], `validation.${key}`, vars);
      }
      return message;
    },
    [patterns, messages, locale],
  );
}
