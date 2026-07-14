'use client';

import type { QuoteDraft } from '@/lib/quote-demo/types';

export function QuoteGeneralFields({
  draft,
  onChange,
  errors,
}: {
  draft: QuoteDraft;
  onChange: (patch: Partial<QuoteDraft>) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="form-grid" id="qd-sec-genel">
      <label className="form-field">
        <span>Teklif Numarası *</span>
        <input
          value={draft.quoteNumber}
          onChange={(e) => onChange({ quoteNumber: e.target.value })}
          required
        />
        {errors.quoteNumber && <em className="form-error" role="alert">{errors.quoteNumber}</em>}
      </label>
      <label className="form-field">
        <span>Teklif Tarihi *</span>
        <input
          type="date"
          value={draft.quoteDate}
          onChange={(e) => onChange({ quoteDate: e.target.value })}
          required
        />
        {errors.quoteDate && <em className="form-error" role="alert">{errors.quoteDate}</em>}
      </label>
      <label className="form-field">
        <span>Geçerlilik Tarihi</span>
        <input
          type="date"
          value={draft.validUntil}
          onChange={(e) => onChange({ validUntil: e.target.value })}
        />
      </label>
      <label className="form-field">
        <span>Teklifi Hazırlayan</span>
        <input
          value={draft.preparedBy}
          onChange={(e) => onChange({ preparedBy: e.target.value })}
          placeholder="Ad Soyad"
        />
      </label>
      <label className="form-field" style={{ gridColumn: '1 / -1' }}>
        <span>Teklif Başlığı</span>
        <input
          value={draft.title}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </label>
    </div>
  );
}
