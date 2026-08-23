export const COOKIE_CONSENT_STORAGE_KEY = "skillsy_cookie_consent_v1";
export const COOKIE_PREFERENCES_EVENT = "skillsy:open-cookie-preferences";

export type CookieConsentChoice = "accepted" | "rejected";

export type CookieConsentState = {
  choice: CookieConsentChoice;
  updatedAt: string;
};

function getBrowserStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readCookieConsent(): CookieConsentState | null {
  const storage = getBrowserStorage();
  if (!storage) {
    return null;
  }

  try {
    const rawValue = storage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue) as Partial<CookieConsentState>;
    if (parsed.choice !== "accepted" && parsed.choice !== "rejected") {
      return null;
    }

    return {
      choice: parsed.choice,
      updatedAt:
        typeof parsed.updatedAt === "string"
          ? parsed.updatedAt
          : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function writeCookieConsent(choice: CookieConsentChoice) {
  const storage = getBrowserStorage();
  if (!storage) {
    return;
  }

  const payload: CookieConsentState = {
    choice,
    updatedAt: new Date().toISOString(),
  };

  try {
    storage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(payload));
  } catch {}
}

export function hasPreferenceCookieConsent() {
  return readCookieConsent()?.choice === "accepted";
}

export function openCookiePreferences() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(COOKIE_PREFERENCES_EVENT));
}
