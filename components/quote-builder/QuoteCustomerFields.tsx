'use client';

import type { QuoteDraft } from '@/lib/quote-demo/types';

export function QuoteCustomerFields({
  draft,
  onChange,
  errors,
}: {
  draft: QuoteDraft;
  onChange: (patch: Partial<QuoteDraft['customer']>) => void;
  errors: Record<string, string>;
}) {
  const c = draft.customer;
  return (
    <div className="form-grid" id="qd-sec-musteri">
      <label className="form-field">
        <span>Müşteri / Firma Adı *</span>
        <input value={c.name} onChange={(e) => onChange({ name: e.target.value })} required />
        {errors.customerName && <em className="form-error" role="alert">{errors.customerName}</em>}
      </label>
      <label className="form-field">
        <span>Yetkili Kişi</span>
        <input value={c.contactPerson} onChange={(e) => onChange({ contactPerson: e.target.value })} />
      </label>
      <label className="form-field">
        <span>Telefon</span>
        <input type="tel" value={c.phone} onChange={(e) => onChange({ phone: e.target.value })} />
      </label>
      <label className="form-field">
        <span>E-posta</span>
        <input type="email" value={c.email} onChange={(e) => onChange({ email: e.target.value })} />
      </label>
      <label className="form-field" style={{ gridColumn: '1 / -1' }}>
        <span>Adres</span>
        <input value={c.address} onChange={(e) => onChange({ address: e.target.value })} />
      </label>
      <label className="form-field">
        <span>Vergi Dairesi</span>
        <input value={c.taxOffice} onChange={(e) => onChange({ taxOffice: e.target.value })} />
      </label>
      <label className="form-field">
        <span>Vergi Numarası</span>
        <input value={c.taxNumber} onChange={(e) => onChange({ taxNumber: e.target.value })} />
      </label>
    </div>
  );
}
