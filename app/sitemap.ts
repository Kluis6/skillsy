import { MetadataRoute } from 'next';
import { UserService } from '@/services/user-service';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://skillsy.com.br';

  // Base routes
  const routes = [
    '',
    '/search',
    '/contacts',
    '/artigosevagas',
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

    return [...routes, ...profileRoutes, ...postRoutes];
  } catch (error) {
    console.error('Error generating sitemap profile routes:', error);
    return routes;
  }
}
