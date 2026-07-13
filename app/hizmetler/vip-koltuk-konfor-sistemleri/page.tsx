import type { Metadata } from 'next';
import ServiceTemplate from '@/components/site/ServiceTemplate';
import { getService } from '@/data/services';

const service = getService('vip-koltuk-konfor-sistemleri')!;

export const metadata: Metadata = {
  title: `${service.title} | İstanbul`,
  description: service.summary,
  keywords: service.keywords,
  alternates: { canonical: '/hizmetler/vip-koltuk-konfor-sistemleri' },
  openGraph: { images: [service.image] },
};

export default function Page() {
  return <ServiceTemplate service={service} />;
}
