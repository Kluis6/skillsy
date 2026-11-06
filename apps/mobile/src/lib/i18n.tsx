import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { DICTIONARIES, INTL_LOCALE, translate, enabledLocales, isLocale, type Locale } from '@skillsy/shared/i18n';
import { formatDate, formatRating } from '@skillsy/shared/i18n/format';
import { CATEGORY_LABEL_KEYS, DAY_LABEL_KEYS } from '@skillsy/shared/i18n/labels';
import type { UserProfile } from '@skillsy/shared/types';
import type { MessageKey, TranslateFn } from '@skillsy/shared/i18n/keys';

import { useAuth } from './auth';
import { db } from './firebase';
import { setSiteLocale } from './site';

// The app's language (docs/i18n-plan.md, E7). Expo Router has no language in
// the routes, so it is app state: the choice saved on the device, then the
// member's preferredLanguage, then the phone's language — within the
// languages switched on (EXPO_PUBLIC_ENABLED_LOCALES; all three by default
// since 06/11/2026). Texts come from the same
// dictionaries as the site.

export const ENABLED_LOCALES = enabledLocales(process.env.EXPO_PUBLIC_ENABLED_LOCALES ?? 'pt,en,es');
const STORAGE_KEY = 'skillsy.language';

function deviceLocale(): Locale {
  try {
    const tag = Intl.DateTimeFormat().resolvedOptions().locale.toLowerCase();
    const base = tag.split('-')[0];
    if (isLocale(base) && ENABLED_LOCALES.includes(base)) return base;
  } catch {
    // Older engines without Intl: Portuguese.
  }
  return 'pt';
}

const allowed = (value: unknown): Locale | null =>
  isLocale(value) && ENABLED_LOCALES.includes(value) ? value : null;

type LocaleState = { locale: Locale; setLocale: (next: Locale) => void };
const LocaleContext = createContext<LocaleState>({ locale: 'pt', setLocale: () => {} });

export function LocaleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [saved, setSaved] = useState<Locale | null>(null);
  const [preferred, setPreferred] = useState<Locale | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => setSaved(allowed(value)));
  }, []);

  // The member's saved language, for a device without a choice yet.
  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'users', user.uid))
      .then((snapshot) => setPreferred(allowed(snapshot.data()?.preferredLanguage)))
      .catch(() => {});
  }, [user]);

  const locale = saved ?? (user ? preferred : null) ?? deviceLocale();

  useEffect(() => {
    setSiteLocale(locale);
  }, [locale]);

  const setLocale = useCallback(
    (next: Locale) => {
      setSaved(next);
      AsyncStorage.setItem(STORAGE_KEY, next);
      // The member's language also decides which notifications they get.
      if (user) updateDoc(doc(db, 'users', user.uid), { preferredLanguage: next }).catch(() => {});
    },
    [user]
  );

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

/** t('area.key', vars) in the app's language. */
export function useT(): TranslateFn {
  const { locale } = useLocale();
  return useCallback<TranslateFn>(
    (key, vars) => translate(DICTIONARIES[locale], INTL_LOCALE[locale], key, vars),
    [locale]
  );
}

/** Labels of values saved in Portuguese (categories, days, report reasons). */
export function useLabels() {
  const t = useT();
  return useMemo(() => {
    const label = (key: string | undefined, value: string) => (key ? t(key as MessageKey) : value);
    return {
      category: (value?: string | null) =>
        value ? label(CATEGORY_LABEL_KEYS[value] && `labels.category.${CATEGORY_LABEL_KEYS[value]}`, value) : '',
      day: (value: string) => label(DAY_LABEL_KEYS[value] && `labels.day.${DAY_LABEL_KEYS[value]}`, value),
      reason: (value: string) => t(`labels.reason.${value}` as MessageKey),
    };
  }, [t]);
}

/** Dates, ratings and counters in the app's language (replaces the pt-BR
 * helpers in @skillsy/shared/format and formatFirestoreDate). */
export function useFormat() {
  const t = useT();
  const labels = useLabels();
  const { locale } = useLocale();
  return useMemo(() => {
    const intl = INTL_LOCALE[locale];
    return {
      /** "5 de nov. de 2026"; "agora" while the server time is pending. */
      date: (value: unknown) => formatDate(value, intl) || t('opportunities.now'),
      rating: (rating?: number) => formatRating(rating, intl),
      reviews: (count: number) => t('common.reviews', { count }),
      recommendations: (count: number) => t('common.recommendations', { count }),
      /** What a professional does, for card subtitles. */
      role: (provider: Partial<UserProfile>) =>
        provider.serviceType ||
        labels.category(provider.category) ||
        (provider.isProvider ? t('card.roleProvider') : t('card.roleMember')),
    };
  }, [t, labels, locale]);
}

/**
 * Translates a message from the shared zod schemas and services, which return
 * Portuguese text: the text is looked up in pt.json "validation" (templates
 * like "Ano deve estar entre 1830 e {year}" included). Same as the site.
 */
export function useValidationMessage() {
  const { locale } = useLocale();
  const patterns = useMemo(
    () =>
      Object.entries(DICTIONARIES.pt.validation as Record<string, string>).map(([key, text]) => {
        const names = [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]);
        const pattern = text
          .split(/\{\w+\}/)
          .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
          .join('(.+?)');
        return { key, names, regex: new RegExp(`^${pattern}$`) };
      }),
    []
  );
  return useCallback(
    (message?: string) => {
      if (!message) return '';
      for (const { key, names, regex } of patterns) {
        const match = regex.exec(message);
        if (!match) continue;
        const vars = Object.fromEntries(names.map((name, index) => [name, match[index + 1]]));
        return translate(DICTIONARIES[locale], INTL_LOCALE[locale], `validation.${key}`, vars);
      }
      return message;
    },
    [patterns, locale]
  );
}
