// Locale routing for the site's proxy.ts (docs/i18n-plan.md, section 3.2).
// Pure function with no imports, so tests run it with plain Node.
//
//   /x            → rewrite to /pt/x (Portuguese has no prefix), unless the
//                   saved choice (cookie) or the browser asks for another
//                   enabled language: then redirect to /en/x or /es/x
//   /pt/x         → 308 to /x (one URL per page in Portuguese)
//   /en/x, /es/x  → served when the language is enabled, 404 otherwise

export type LocaleRoute =
  | { action: "next" }
  | { action: "rewrite"; pathname: string }
  | { action: "redirect"; pathname: string; status: 307 | 308 }
  | { action: "notFound" };

export type LocaleRouteInput = {
  pathname: string;
  /** Value of the `lang` cookie (the language switcher writes it). */
  cookie?: string;
  acceptLanguage?: string | null;
  /** Enabled languages, the default one included. */
  enabled: readonly string[];
  /** Every supported language, enabled or not. */
  supported: readonly string[];
  defaultLocale: string;
};

/** Accept-Language → language codes by preference ("es-MX,en;q=0.5" → ["es-mx", "en"]). */
export function parseAcceptLanguage(header: string | null | undefined): string[] {
  if (!header) return [];
  return header
    .split(",")
    .map((part, index) => {
      const [tag, ...params] = part.trim().toLowerCase().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      const quality = q ? Number(q.slice(2)) : 1;
      return { tag, quality: Number.isFinite(quality) ? quality : 0, index };
    })
    .filter(({ tag, quality }) => tag && tag !== "*" && quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index)
    .map(({ tag }) => tag);
}

/** First enabled language the browser accepts, by base language
 * (es-MX, es-AR and es-ES all mean "es"); the default when none matches. */
export function matchLocale(header: string | null | undefined, enabled: readonly string[], defaultLocale: string) {
  for (const tag of parseAcceptLanguage(header)) {
    const base = tag.split("-")[0];
    if (enabled.includes(base)) return base;
  }
  return defaultLocale;
}

export function resolveLocaleRoute({
  pathname,
  cookie,
  acceptLanguage,
  enabled,
  supported,
  defaultLocale,
}: LocaleRouteInput): LocaleRoute {
  const first = pathname.split("/")[1] ?? "";

  if (first === defaultLocale) {
    // Images Next generates for a route (opengraph-image) get the internal
    // /pt/... URL in the page's meta tags: serve them as they are.
    if (pathname.split("/").some((part) => part.startsWith("opengraph-image"))) return { action: "next" };
    return { action: "redirect", pathname: pathname.slice(first.length + 1) || "/", status: 308 };
  }
  if (supported.includes(first)) {
    return enabled.includes(first) ? { action: "next" } : { action: "notFound" };
  }

  const preferred =
    cookie && enabled.includes(cookie) ? cookie : matchLocale(acceptLanguage, enabled, defaultLocale);
  const prefixed = `/${preferred}${pathname === "/" ? "" : pathname}`;
  if (preferred !== defaultLocale) return { action: "redirect", pathname: prefixed, status: 307 };
  return { action: "rewrite", pathname: prefixed };
}

/** Path for a language: no prefix for the default one ("/profile/1", "en" → "/en/profile/1"). */
export function localizedPath(path: string, locale: string, defaultLocale: string) {
  if (locale === defaultLocale || /^[a-z]+:/i.test(path) || path.startsWith("#")) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path.startsWith("/") ? "" : "/"}${path}`;
}
