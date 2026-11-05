import type { Locale } from "./locales";
import pt from "./pt.json";
import en from "./en.json";
import es from "./es.json";

/** pt.json is the source of truth: the other languages must have the same
 * keys (npm run i18n:check, also in CI). */
export type Dictionary = typeof pt;

export const DICTIONARIES: Record<Locale, Dictionary> = { pt, en, es };

export * from "./locales";
export * from "./translate";
export * from "./format";
