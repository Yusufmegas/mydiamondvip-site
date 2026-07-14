'use client';

import type { QuoteDraft } from '@/lib/quote-demo/types';

export function QuoteCommercialTerms({
  draft,
  onChange,
}: {
  draft: QuoteDraft;
  onChange: (patch: Partial<QuoteDraft['terms']>) => void;
}) {
  const t = draft.terms;
  return (
    <div id="qd-sec-kosullar">
      <label className="form-field">
        <span>Ödeme Planı</span>
        <textarea rows={3} value={t.payment} onChange={(e) => onChange({ payment: e.target.value })} />
      </label>
      <div className="form-grid" style={{ marginTop: 18 }}>
        <label className="form-field">
          <span>Teslim Süresi</span>
          <input
            value={t.delivery}
            onChange={(e) => onChange({ delivery: e.target.value })}
            placeholder="Örn. 45 iş günü"
          />
        </label>
        <label className="form-field">
          <span>Teklif Geçerliliği</span>
          <input value={t.validity} onChange={(e) => onChange({ validity: e.target.value })} />
        </label>
      </div>
      <label className="form-field" style={{ marginTop: 18 }}>
        <span>Garanti</span>
        <textarea rows={2} value={t.warranty} onChange={(e) => onChange({ warranty: e.target.value })} />
      </label>
      <label className="form-field" style={{ marginTop: 18 }}>
        <span>Ek Notlar</span>
        <textarea
          rows={3}
          value={t.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="Teklife eklenecek özel notlar (opsiyonel)"
        />
      </label>
    </div>
  );
}
