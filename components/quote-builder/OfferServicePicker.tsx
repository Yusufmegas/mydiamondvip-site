'use client';

// Firma paneli hizmet seçimi — müşteri formundaki ServicePicker ile AYNI
// premium tasarım dili (.svc-* sınıfları), fakat farklı kategori davranışı:
// kategori checkbox'ı TÜM alt hizmetleri seçer/kaldırır (select-all).
// Ana sitedeki müşteri formu davranışı bilinçli olarak DEĞİŞTİRİLMEMİŞTİR;
// riskli ortak refactor yerine panele özel bu bileşen kullanılır.
import { useState } from 'react';
import { offerServiceCategories } from '@/data/offerServices';

export function OfferServicePicker({
  selectedIds,
  onToggleItem,
  onToggleCategory,
}: {
  selectedIds: Set<string>;
  onToggleItem: (categoryId: string, itemId: string) => void;
  onToggleCategory: (categoryId: string, selectAll: boolean) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="svc-picker">
      {offerServiceCategories.map((cat) => {
        const selectedCount = cat.items.filter((i) => selectedIds.has(i.id)).length;
        const allSelected = selectedCount === cat.items.length && cat.items.length > 0;
        const indeterminate = selectedCount > 0 && !allSelected;
        const open = openId === cat.id;
        const panelId = `offer-svc-panel-${cat.id}`;
        return (
          <div
            key={cat.id}
            className={`svc-cat${open ? ' open' : ''}${selectedCount > 0 ? ' has-selection' : ''}`}
          >
            <div className="svc-cat-head">
              <label className="svc-cat-select">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = indeterminate;
                  }}
                  aria-label={`${cat.title} — tüm alt hizmetleri ${allSelected ? 'kaldır' : 'seç'}`}
                  onChange={() => onToggleCategory(cat.id, !allSelected)}
                />
                <span className="svc-cat-title">{cat.title}</span>
              </label>
              <span className="svc-cat-meta">
                <span className="svc-count">{selectedCount} seçili</span>
                <button
                  type="button"
                  className="svc-expand"
                  aria-expanded={open}
                  aria-controls={panelId}
                  aria-label={`${cat.title} alt hizmetlerini ${open ? 'kapat' : 'aç'}`}
                  onClick={() => setOpenId(open ? null : cat.id)}
                >
                  {open ? '−' : '+'}
                </button>
              </span>
            </div>
            {open && (
              <div id={panelId} className="svc-items" role="group" aria-label={`${cat.title} alt hizmetleri`}>
                {cat.items.map((item) => {
                  const checked = selectedIds.has(item.id);
                  return (
                    <label key={item.id} className={`svc-item${checked ? ' checked' : ''}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onToggleItem(cat.id, item.id)}
                      />
                      <span>{item.title}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
