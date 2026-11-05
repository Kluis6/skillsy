import { NextResponse, type NextRequest } from 'next/server';
import { DEFAULT_LOCALE, LOCALES, enabledLocales } from '@skillsy/shared/i18n/locales';
import { resolveLocaleRoute } from '@skillsy/shared/i18n/routing';

// Every page lives under app/[lang]. Portuguese keeps today's URLs (no
// prefix, rewritten to /pt); English and Spanish use /en and /es once they are
// switched on in NEXT_PUBLIC_ENABLED_LOCALES. Rules in
// packages/shared/src/i18n/routing.ts.
const enabled = enabledLocales(process.env.NEXT_PUBLIC_ENABLED_LOCALES);

export function proxy(request: NextRequest) {
  const route = resolveLocaleRoute({
    pathname: request.nextUrl.pathname,
    cookie: request.cookies.get('lang')?.value,
    acceptLanguage: request.headers.get('accept-language'),
    enabled,
    supported: LOCALES,
    defaultLocale: DEFAULT_LOCALE,
  });

  if (route.action === 'next') return NextResponse.next();
  if (route.action === 'notFound') {
    // A path no page matches: Next answers with app/global-not-found.tsx.
    const url = request.nextUrl.clone();
    url.pathname = '/_not-found';
    return NextResponse.rewrite(url, { status: 404 });
  }

  const url = request.nextUrl.clone();
  url.pathname = route.pathname;
  if (route.action === 'redirect') return NextResponse.redirect(url, route.status);

  const response = NextResponse.rewrite(url);
  // The page depends on the language headers when more than one is on.
  if (enabled.length > 1) response.headers.set('Vary', 'Accept-Language, Cookie');
  return response;
}

export const config = {
  // Not for Next's files, the API, files with an extension (icons, images,
  // robots.txt, sitemap.xml) or the site-wide share image.
  matcher: ['/((?!_next|api|opengraph-image|.*\\..*).*)'],
};
