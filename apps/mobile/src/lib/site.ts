import * as WebBrowser from 'expo-web-browser';

import { localizedPath } from '@skillsy/shared/i18n/routing';

export const SITE_URL = 'https://www.skillsy.com.br';

// The app's language (set by LocaleProvider), so pages and shared links open
// on the site in the same language ("/termos" → "/en/termos").
let siteLocale = 'pt';
export function setSiteLocale(locale: string) {
  siteLocale = locale;
}

/** Full site URL for a path, in the app's language. */
export function siteUrl(path: string) {
  return `${SITE_URL}${localizedPath(path, siteLocale, 'pt')}`;
}

/** Opens a page of the site in the in-app browser (Custom Tab on Android). */
export function openSite(path: string) {
  return WebBrowser.openBrowserAsync(siteUrl(path));
}
