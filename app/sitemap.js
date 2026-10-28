import { getGuides } from '@/lib/data';

export const runtime = 'nodejs';

export default function sitemap() {
  const baseUrl = process.env.SITE_URL || 'http://localhost:3000';
  const lastModified = new Date();

  const staticRoutes = [
    '',
    '/how-it-works',
    '/pricing',
    '/install',
    '/buy',
    '/guides',
    '/faq',
    '/updates',
    '/about',
    '/contact',
    '/refunds',
    '/delivery',
    '/terms',
    '/privacy',
    '/api-docs',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: route === '' || route === '/pricing' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route === '/pricing' || route === '/install' ? 0.9 : 0.7,
  }));

  const guides = getGuides();
  const guideRoutes = (guides || []).map((guide) => ({
    url: `${baseUrl}/guides/${guide.slug}`,
    lastModified: guide.updatedAt ? new Date(guide.updatedAt) : lastModified,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...guideRoutes];
}
