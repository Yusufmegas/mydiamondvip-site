import type { Metadata } from 'next';
import { PageHero, CtaBand } from '@/components/site/Shared';
import ProjectsGrid from '@/components/site/ProjectsGrid';
import { getPublishedProjects } from '@/lib/projects/repository';

// Panelden yayınlama sonrası revalidatePath ile anında tazelenir;
// ek güvence olarak periyodik ISR.
export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Projeler — VIP Araç Dizayn Portfolyosu',
  description:
    'MyDiamondVIP proje portfolyosu: Mercedes Vito & Sprinter VIP dönüşümleri, Volkswagen VIP dizayn, binek araç deri döşeme, zırhlı araç ve turizm araçları.',
  alternates: { canonical: '/projeler' },
};

export default async function Page() {
  const projects = await getPublishedProjects();

  return (
    <>
      <PageHero
        kicker="Projeler"
        title="Atölyeden Seçilmiş İşler"
        lead="Her proje, sahibinin kullanım senaryosuna göre sıfırdan kurgulanır. Kategoriye göre filtreleyin, detay sayfalarında malzeme ve uygulama bilgilerini inceleyin."
      />
      <section className="section section-light">
        <div className="container">
          <ProjectsGrid projects={projects} />
        </div>
      </section>
      <CtaBand />
    </>
  );
}
