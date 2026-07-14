'use client';

// Mevcut data/quoteVehicles.ts bağlı marka-model verisini yeniden kullanır —
// ikinci bir liste OLUŞTURULMAZ. "Diğer" davranışı müşteri formuyla aynıdır.
import type { QuoteDraft } from '@/lib/quote-demo/types';
import { vehicleBrands, OTHER_OPTION } from '@/data/quoteVehicles';
import { chassisTypes, usagePurposes } from '@/data/quoteServices';

export function QuoteVehicleFields({
  draft,
  onChange,
  errors,
}: {
  draft: QuoteDraft;
  onChange: (patch: Partial<QuoteDraft['vehicle']>) => void;
  errors: Record<string, string>;
}) {
  const v = draft.vehicle;
  const models = vehicleBrands.find((b) => b.name === v.brand)?.models ?? [];
  const brandIsOther = v.brand === OTHER_OPTION;
  const modelIsOther = v.model === OTHER_OPTION;

  return (
    <div className="form-grid" id="qd-sec-arac">
      <label className="form-field">
        <span>Araç Markası *</span>
        <select
          value={v.brand}
          required
          onChange={(e) => onChange({ brand: e.target.value, model: '', modelCustom: '' })}
        >
          <option value="" disabled>Marka seçiniz</option>
          {vehicleBrands.map((b) => <option key={b.name} value={b.name}>{b.name}</option>)}
        </select>
        {errors.vehicleBrand && <em className="form-error" role="alert">{errors.vehicleBrand}</em>}
      </label>

      {!brandIsOther && (
        <label className="form-field">
          <span>Araç Modeli *</span>
          <select
            value={v.model}
            required
            disabled={v.brand === ''}
            aria-disabled={v.brand === ''}
            onChange={(e) => onChange({ model: e.target.value })}
          >
            <option value="" disabled>
              {v.brand === '' ? 'Önce marka seçiniz' : 'Model seçiniz'}
            </option>
            {models.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          {errors.vehicleModel && <em className="form-error" role="alert">{errors.vehicleModel}</em>}
        </label>
      )}

      {brandIsOther && (
        <label className="form-field">
          <span>Araç Markasını Yazınız *</span>
          <input
            value={v.brandCustom}
            required
            onChange={(e) => onChange({ brandCustom: e.target.value })}
            placeholder="Örn. Hyundai"
          />
          {errors.vehicleBrand && <em className="form-error" role="alert">{errors.vehicleBrand}</em>}
        </label>
      )}
      {(brandIsOther || modelIsOther) && (
        <label className="form-field">
          <span>Araç Modelini Yazınız *</span>
          <input
            value={v.modelCustom}
            required
            onChange={(e) => onChange({ modelCustom: e.target.value })}
            placeholder="Örn. Staria"
          />
          {errors.vehicleModel && <em className="form-error" role="alert">{errors.vehicleModel}</em>}
        </label>
      )}

      <label className="form-field">
        <span>Model Yılı</span>
        <input value={v.year} onChange={(e) => onChange({ year: e.target.value })} placeholder="Örn. 2024" />
      </label>
      <label className="form-field">
        <span>Şasi / Uzunluk Tipi</span>
        <select value={v.chassis} onChange={(e) => onChange({ chassis: e.target.value })}>
          <option value="">Seçiniz (opsiyonel)</option>
          {chassisTypes.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <label className="form-field">
        <span>Plaka</span>
        <input value={v.plate} onChange={(e) => onChange({ plate: e.target.value })} placeholder="34 ABC 123" />
      </label>
      <label className="form-field">
        <span>Araç Adedi</span>
        <input
          type="number"
          min={1}
          step={1}
          value={v.count}
          onChange={(e) => onChange({ count: e.target.value })}
        />
      </label>
      <label className="form-field">
        <span>Kullanım Amacı</span>
        <select value={v.purpose} onChange={(e) => onChange({ purpose: e.target.value })}>
          <option value="">Seçiniz (opsiyonel)</option>
          {usagePurposes.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </label>
      <label className="form-field" style={{ gridColumn: '1 / -1' }}>
        <span>Proje Açıklaması</span>
        <textarea
          rows={3}
          value={v.projectNote}
          onChange={(e) => onChange({ projectNote: e.target.value })}
          placeholder="Projeye dair kısa açıklama (opsiyonel)"
        />
      </label>
    </div>
  );
}
