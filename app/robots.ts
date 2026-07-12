import type { MetadataRoute } from 'next';
import { contact } from '@/data/contact';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${contact.siteUrl}/sitemap.xml`,
  };
}
