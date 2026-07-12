import type { MetadataRoute } from 'next';
import { services } from '@/data/services';
import { projects } from '@/data/projects';
import { blogPosts } from '@/data/blog';
import { contact } from '@/data/contact';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = contact.siteUrl;
  const staticRoutes = [
    '', '/kurumsal', '/hizmetler', '/projeler', '/tasarim-sureci',
    '/malzeme-iscilik', '/blog', '/teklif-formu', '/randevu-talebi', '/iletisim',
  ].map((p) => ({
    url: `${base}${p}`,
    changeFrequency: 'monthly' as const,
    priority: p === '' ? 1 : 0.8,
  }));

  return [
    ...staticRoutes,
    ...services.map((s) => ({
      url: `${base}/hizmetler/${s.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    })),
    ...projects.map((p) => ({
      url: `${base}/projeler/${p.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...blogPosts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.date,
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    })),
  ];
}
