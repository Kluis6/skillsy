import * as WebBrowser from 'expo-web-browser';

export const SITE_URL = 'https://www.skillsy.com.br';

/** Opens a page of the site in the in-app browser (Custom Tab on Android). */
export function openSite(path: string) {
  return WebBrowser.openBrowserAsync(`${SITE_URL}${path}`);
}
