import type { Metadata } from 'next';
import ServiceTemplate from '@/components/site/ServiceTemplate';
import { getService } from '@/data/services';

const service = getService('mini-bar-masa-mobil-ofis')!;

export const metadata: Metadata = {
  title: `${service.title} | İstanbul`,
  description: service.summary,
  keywords: service.keywords,
  alternates: { canonical: '/hizmetler/mini-bar-masa-mobil-ofis' },
  openGraph: { images: [service.image] },
};

export default function Page() {
  return <ServiceTemplate service={service} />;
}
