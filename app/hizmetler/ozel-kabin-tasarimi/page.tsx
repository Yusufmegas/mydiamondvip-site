import type { Metadata } from 'next';
import ServiceTemplate from '@/components/site/ServiceTemplate';
import { getService } from '@/data/services';

const service = getService('ozel-kabin-tasarimi')!;

export const metadata: Metadata = {
  title: `${service.title} | İstanbul`,
  description: service.summary,
  keywords: service.keywords,
  alternates: { canonical: '/hizmetler/ozel-kabin-tasarimi' },
  openGraph: { images: [service.image] },
};

export default function Page() {
  return <ServiceTemplate service={service} />;
}
