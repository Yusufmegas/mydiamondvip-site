'use client';

// Premium portfolyo: kategori filtreli sinematik vitrin ızgarası.

import { useState } from 'react';
import { projects, projectCategories, type ProjectCategory } from '@/data/projects';
import { ShowcaseCard } from './Cards';

export default function ProjectsGrid() {
  const [filter, setFilter] = useState<ProjectCategory | 'Tümü'>('Tümü');
  const visible = filter === 'Tümü' ? projects : projects.filter((p) => p.categories.includes(filter));

  return (
    <>
      <div className="filter-chips" role="tablist" aria-label="Proje filtreleri" data-reveal="fade">
        {(['Tümü', ...projectCategories] as const).map((c) => (
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
