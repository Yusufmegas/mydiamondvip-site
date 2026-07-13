'use client';

// Admin Matterport önizlemesi — click-to-load (public davranışla aynı ilke).
// URL client'ta da normalize edilir; asıl doğrulama server'dadır.
import { useMemo, useState } from 'react';
import { normalizeMatterportUrl } from '@/lib/projects/matterport';

export function MatterportPreview({ input }: { input: string }) {
  const [active, setActive] = useState(false);
  const normalized = useMemo(() => (input.trim() ? normalizeMatterportUrl(input) : null), [input]);

  if (!normalized) return null;
  if ('error' in normalized) {
    return <p className="adm-error" style={{ marginTop: 8 }}>{normalized.error}</p>;
  }

  return (
    <div style={{ marginTop: 12 }}>
      <p className="adm-hint">
        Model ID: <code>{normalized.modelId}</code> · Temiz URL: <code>{normalized.embedUrl}</code>
      </p>
      {active ? (
        <div style={{ position: 'relative', aspectRatio: '16 / 9', marginTop: 8 }}>
          <iframe
            src={normalized.embedUrl}
            title="Matterport önizleme"
            allow="autoplay; fullscreen; web-share; xr-spatial-tracking"
            allowFullScreen
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
          />
          <button
            type="button"
            className="adm-btn adm-btn-sm"
            style={{ position: 'absolute', top: 8, right: 8 }}
            onClick={() => setActive(false)}
          >
            Önizlemeyi Kapat
          </button>
        </div>
      ) : (
        <button type="button" className="adm-btn adm-btn-sm" style={{ marginTop: 8 }} onClick={() => setActive(true)}>
          360° Önizlemeyi Yükle
        </button>
      )}
    </div>
  );
}
