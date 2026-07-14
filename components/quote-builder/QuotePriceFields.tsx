'use client';

// TEK toplam fiyat alanı — birim fiyat / satır fiyatı / ara toplam /
// otomatik KDV hesabı YOK ve eklenmeyecek.
import type { QuoteDraft, QuoteCurrency, QuoteVatMode } from '@/lib/quote-demo/types';
import { parseAmount, formatAmountTR } from '@/lib/quote-demo/types';

const CURRENCIES: QuoteCurrency[] = ['TL', 'USD', 'EUR'];
const VAT_MODES: QuoteVatMode[] = ['KDV Hariç', 'KDV Dahil', 'KDV Uygulanmayacaktır'];

export function QuotePriceFields({
  draft,
  onChange,
  errors,
}: {
  draft: QuoteDraft;
  onChange: (patch: Partial<QuoteDraft['price']>) => void;
  errors: Record<string, string>;
}) {
  const parsed = parseAmount(draft.price.amount);
  return (
    <div id="qd-sec-fiyat">
      <div className="form-grid">
        <label className="form-field">
          <span>Toplam Tutar *</span>
          <input
            inputMode="decimal"
            value={draft.price.amount}
            onChange={(e) => onChange({ amount: e.target.value })}
            placeholder="Örn. 50.000"
            required
          />
          {errors.price && <em className="form-error" role="alert">{errors.price}</em>}
        </label>
        <label className="form-field">
          <span>Para Birimi *</span>
          <select
            value={draft.price.currency}
            onChange={(e) => onChange({ currency: e.target.value as QuoteCurrency })}
          >
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="form-field">
          <span>KDV Durumu *</span>
          <select
            value={draft.price.vat}
            onChange={(e) => onChange({ vat: e.target.value as QuoteVatMode })}
          >
            {VAT_MODES.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>
      </div>
      {parsed !== null && (
        <p className="note" style={{ marginTop: 4 }}>
          Teklifte görünecek biçim: <strong>{formatAmountTR(parsed)} {draft.price.currency}
          {draft.price.vat === 'KDV Hariç' ? ' + KDV' : ''}</strong>
        </p>
      )}
    </div>
  );
}
