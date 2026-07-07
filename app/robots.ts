import { MetadataRoute } from 'next';
import { getPublicBaseUrl } from '@/lib/public-metadata';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getPublicBaseUrl();
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/admin/',
        '/blocked',
        '/contacts',
        '/meus-artigos',
        '/meus-artigos/',
        '/recovery',
        '/signin',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
