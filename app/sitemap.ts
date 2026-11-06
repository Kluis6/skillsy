import { MetadataRoute } from 'next';
import { getPublicBaseUrl } from '@/lib/public-metadata';
import { UserService } from '@/services/user-service';
import { DEFAULT_LOCALE, HTML_LANG, enabledLocales } from '@skillsy/shared/i18n/locales';
import { localizedPath } from '@skillsy/shared/i18n/routing';

type Entry = MetadataRoute.Sitemap[number];
const ENABLED_LOCALES = enabledLocales(process.env.NEXT_PUBLIC_ENABLED_LOCALES);

/**
 * One entry per enabled language for each page, each listing the others as
 * alternates (hreflang). With only Portuguese on, the list is unchanged.
 */
function withLanguages(baseUrl: string, entries: Entry[]): MetadataRoute.Sitemap {
  if (ENABLED_LOCALES.length === 1) return entries;
  return entries.flatMap((entry) => {
    const path = entry.url.slice(baseUrl.length) || '/';
    const url = (locale: (typeof ENABLED_LOCALES)[number]) =>
      `${baseUrl}${localizedPath(path, locale, DEFAULT_LOCALE)}`.replace(/\/$/, '') || baseUrl;
    const languages = Object.fromEntries(ENABLED_LOCALES.map((locale) => [HTML_LANG[locale], url(locale)]));
    return ENABLED_LOCALES.map((locale) => ({ ...entry, url: url(locale), alternates: { languages } }));
  });
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getPublicBaseUrl();

  const routes = [
    '',
    '/search',
    '/artigosevagas',
    '/join',
    '/weareskillsy',
    '/donation',
    '/termos',
    '/privacidade',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic profile routes
  try {
    const providers = await UserService.getAllProviders();
    const { PostService } = await import('@/services/post-service');
    const posts = await PostService.getPublishedPosts();
    const profileRoutes = providers.map((provider) => ({
      url: `${baseUrl}/profile/${provider.uid}`,
      lastModified: provider.createdAt?.seconds 
        ? new Date(provider.createdAt.seconds * 1000) 
        : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    const postRoutes = posts.map((post) => ({
      url: `${baseUrl}/artigosevagas/${post.slug}`,
      lastModified: post.publishedAt?.seconds
        ? new Date(post.publishedAt.seconds * 1000)
        : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    return withLanguages(baseUrl, [...routes, ...profileRoutes, ...postRoutes]);
  } catch (error) {
    console.error('Error generating sitemap profile routes:', error);
    return withLanguages(baseUrl, routes);
  }
}
