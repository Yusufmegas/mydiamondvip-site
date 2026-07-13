'use client';

// Premium portfolyo: kategori filtreli sinematik vitrin ızgarası.
// Veri artık server'dan (repository → yalnızca PUBLISHED) prop olarak gelir.

import { useMemo, useState } from 'react';
import type { ProjectView } from '@/lib/projects/types';
import { ShowcaseCard } from './Cards';

export default function ProjectsGrid({ projects }: { projects: ProjectView[] }) {
  const categories = useMemo(() => {
    const seen: string[] = [];
    for (const p of projects) for (const c of p.categories) if (!seen.includes(c)) seen.push(c);
    return seen;
  }, [projects]);

  const [filter, setFilter] = useState<string>('Tümü');
  const visible = filter === 'Tümü' ? projects : projects.filter((p) => p.categories.includes(filter));

  return (
    <>
      <div className="filter-chips" role="tablist" aria-label="Proje filtreleri" data-reveal="fade">
        {['Tümü', ...categories].map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={filter === c}
            className={`chip${filter === c ? ' is-active' : ''}`}
            onClick={() => setFilter(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="showcase-grid" data-reveal-group>
        {visible.map((p) => <ShowcaseCard key={`${filter}-${p.slug}`} project={p} />)}
      </div>
      {visible.length === 0 && <p className="note">Bu kategoride henüz yayınlanmış proje yok.</p>}
    </>
  );
}
