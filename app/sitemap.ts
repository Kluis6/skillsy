import { MetadataRoute } from 'next';
import { UserService } from '@/services/user-service';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://skillsy.com.br';

  // Base routes
  const routes = [
    '',
    '/search',
    '/contacts',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic profile routes
  try {
    const providers = await UserService.getAllProviders();
    const profileRoutes = providers.map((provider) => ({
      url: `${baseUrl}/profile/${provider.uid}`,
      lastModified: provider.updatedAt ? new Date(provider.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    return [...routes, ...profileRoutes];
  } catch (error) {
    console.error('Error generating sitemap profile routes:', error);
    return routes;
  }
}
