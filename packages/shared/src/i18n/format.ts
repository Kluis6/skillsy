// Dates and numbers in each language with Intl, replacing the fixed pt-BR
// formats (and date-fns' ptBR) used today. No imports, so tests can run it
// with plain Node. `intlLocale` is INTL_LOCALE[locale] from ./locales.

/** Firestore Timestamp, { seconds }, Date or epoch milliseconds → Date. */
export function toDate(value: unknown): Date | null {
  if (value instanceof Date) return value;
  if (typeof value === "number") return new Date(value);
  if (value && typeof value === "object") {
    if ("toDate" in value && typeof value.toDate === "function") return value.toDate() as Date;
    if ("seconds" in value) return new Date(Number(value.seconds) * 1000);
  }
  return null;
}

/** "5 de nov. de 2026" / "Nov 5, 2026" / "5 nov 2026". */
export function formatDate(value: unknown, intlLocale: string, style: "medium" | "long" = "medium") {
  const date = toDate(value);
  return date ? new Intl.DateTimeFormat(intlLocale, { dateStyle: style }).format(date) : "";
}

/** "há 3 dias" / "3 days ago" / "hace 3 días". */
export function formatRelative(value: unknown, intlLocale: string, now = Date.now()) {
  const date = toDate(value);
  if (!date) return "";
  const seconds = Math.round((date.getTime() - now) / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["week", 604_800],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];
  const format = new Intl.RelativeTimeFormat(intlLocale, { numeric: "auto" });
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return format.format(Math.round(seconds / size), unit);
  }
  return format.format(0, "minute");
}

/** Average rating with one decimal: 4.5 → "4,5" (pt, es) / "4.5" (en). */
export function formatRating(rating: number | undefined, intlLocale: string) {
  return new Intl.NumberFormat(intlLocale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(rating || 0);
}

export function formatNumber(value: number, intlLocale: string) {
  return new Intl.NumberFormat(intlLocale).format(value);
}
