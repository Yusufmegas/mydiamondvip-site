'use client';

import { useState } from 'react';
import type { SelectedOfferService } from '@/lib/quote-demo/types';

export function SelectedServicesEditor({
  services,
  onUpdate,
  onRemove,
  onMove,
  onAddCustom,
}: {
  services: SelectedOfferService[];
  onUpdate: (id: string, patch: Partial<Pick<SelectedOfferService, 'quantity' | 'description'>>) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onAddCustom: (title: string, description: string, quantity: number) => void;
}) {
  const [showCustom, setShowCustom] = useState(false);
  const [cTitle, setCTitle] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cQty, setCQty] = useState('1');
  const [cError, setCError] = useState<string | null>(null);

  const sorted = [...services].sort((a, b) => a.sortOrder - b.sortOrder);

  const addCustom = () => {
    const qty = Math.floor(Number(cQty));
    if (!cTitle.trim()) {
      setCError('Hizmet adı zorunludur.');
      return;
    }
    if (!Number.isFinite(qty) || qty < 1) {
      setCError('Adet en az 1 olan tam sayı olmalıdır.');
      return;
    }
    onAddCustom(cTitle.trim(), cDesc.trim(), qty);
    setCTitle('');
    setCDesc('');
    setCQty('1');
    setCError(null);
    setShowCustom(false);
  };

  return (
    <div id="qd-sec-secilen">
      <p className="qd-field-label" style={{ marginBottom: 12 }}>
        Seçilen Hizmetler — {sorted.length} kalem
      </p>

      {sorted.length === 0 && (
        <p className="note">Henüz hizmet seçilmedi. Yukarıdaki listeden hizmet işaretleyin.</p>
      )}

      <div className="qd-selected-list">
        {sorted.map((s, i) => (
          <div key={s.id} className="qd-selected-item">
            <div className="qd-selected-head">
              <span className="qd-selected-no">{i + 1}.</span>
              <span className="qd-selected-title">
                {s.title}
                {s.isCustom && <span className="qd-demo-badge" style={{ marginLeft: 8 }}>Özel</span>}
              </span>
              <span className="qd-selected-controls">
                <button
                  type="button"
                  className="qd-icon-btn"
                  disabled={i === 0}
                  aria-label={`${s.title} hizmetini yukarı taşı`}
                  onClick={() => onMove(s.id, -1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="qd-icon-btn"
                  disabled={i === sorted.length - 1}
                  aria-label={`${s.title} hizmetini aşağı taşı`}
                  onClick={() => onMove(s.id, 1)}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="qd-icon-btn"
                  aria-label={`${s.title} hizmetini kaldır`}
                  onClick={() => onRemove(s.id)}
                >
                  ✕
                </button>
              </span>
            </div>
            <div className="qd-selected-body">
              <label>
                <span className="qd-field-label">Adet</span>
                <input
                  className="qd-qty-input"
                  type="number"
                  min={1}
                  step={1}
                  value={s.quantity}
                  aria-label={`${s.title} adedi`}
                  onChange={(e) => {
                    const n = Math.floor(Number(e.target.value));
                    if (Number.isFinite(n) && n >= 1) onUpdate(s.id, { quantity: n });
                  }}
                  style={{ width: '100%' }}
                />
              </label>
              <label>
                <span className="qd-field-label">Açıklama</span>
                <textarea
                  rows={2}
                  value={s.description}
                  aria-label={`${s.title} açıklaması`}
                  onChange={(e) => onUpdate(s.id, { description: e.target.value })}
                  style={{ width: '100%' }}
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      {!showCustom ? (
        <button
          type="button"
          className="qd-btn"
          style={{ marginTop: 14 }}
          onClick={() => setShowCustom(true)}
        >
          + Özel Hizmet Ekle
        </button>
      ) : (
        <div className="qd-custom-form">
          <label>
            <span className="qd-field-label">Hizmet Adı *</span>
            <input value={cTitle} onChange={(e) => setCTitle(e.target.value)} style={{ width: '100%' }} />
          </label>
          <label>
            <span className="qd-field-label">Açıklama</span>
            <textarea rows={2} value={cDesc} onChange={(e) => setCDesc(e.target.value)} style={{ width: '100%' }} />
          </label>
          <label>
            <span className="qd-field-label">Adet *</span>
            <input
              className="qd-qty-input"
              type="number"
              min={1}
              step={1}
              value={cQty}
              onChange={(e) => setCQty(e.target.value)}
              style={{ width: 100 }}
            />
          </label>
          {cError && <p className="form-error" role="alert">{cError}</p>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="qd-btn qd-btn-primary" onClick={addCustom}>Ekle</button>
            <button type="button" className="qd-btn" onClick={() => { setShowCustom(false); setCError(null); }}>
              Vazgeç
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
