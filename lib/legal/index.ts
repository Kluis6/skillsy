import { TERMS_UPDATED_LABEL, TERMS_VERSION } from "@skillsy/shared/terms";
import { formatDate } from "@skillsy/shared/i18n/format";
import { INTL_LOCALE, type Locale } from "@skillsy/shared/i18n/locales";
import { TERMS } from "./terms";
import { TERMS_EN } from "./terms.en";
import { TERMS_ES } from "./terms.es";
import { PRIVACY } from "./privacy";
import { PRIVACY_EN } from "./privacy.en";
import { PRIVACY_ES } from "./privacy.es";
import type { LegalDocumentContent } from "./types";

// The Portuguese documents are the official ones; English and Spanish are
// translations (the pages say so, and the terms say Portuguese prevails).

function updatedAt(locale: Locale) {
  // Noon avoids the date shifting a day in other time zones.
  return locale === "pt"
    ? TERMS_UPDATED_LABEL
    : formatDate(new Date(`${TERMS_VERSION}T12:00:00`), INTL_LOCALE[locale], "long");
}

export function getTerms(locale: Locale): LegalDocumentContent {
  if (locale === "en") return { ...TERMS_EN, updatedAt: updatedAt(locale) };
  if (locale === "es") return { ...TERMS_ES, updatedAt: updatedAt(locale) };
  return TERMS;
}

export function getPrivacy(locale: Locale): LegalDocumentContent {
  if (locale === "en") return { ...PRIVACY_EN, updatedAt: updatedAt(locale) };
  if (locale === "es") return { ...PRIVACY_ES, updatedAt: updatedAt(locale) };
  return PRIVACY;
}
