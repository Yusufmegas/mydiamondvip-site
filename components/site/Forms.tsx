'use client';

// Teklif ve randevu formları. Sunucu tarafı olmadığı için gönderim,
// alanlardan derlenen mesajla WhatsApp'a (tek tıkla) aktarılır.
// Hedef numara HER ZAMAN data/contact.ts üzerinden alınır.

import { useMemo, useState, type FormEvent } from 'react';
import { contact, whatsappLink } from '@/data/contact';
import { quoteServiceCategories, chassisTypes, usagePurposes } from '@/data/quoteServices';
import { vehicleBrands, OTHER_OPTION } from '@/data/quoteVehicles';

// ---------- WhatsApp mesaj yardımcıları ----------

/** "• Etiket: değer" satırları — boş değerler mesaja hiç girmez. */
function bulletSection(title: string, rows: Array<[string, string]>): string | null {
  const filled = rows
    .map(([k, v]) => [k, v.trim()] as [string, string])
    .filter(([, v]) => v !== '');
  if (filled.length === 0) return null;
  return `*${title}*\n${filled.map(([k, v]) => `• ${k}: ${v}`).join('\n')}`;
}

/** Mesajı güvenli URL'ye çevirip yeni sekmede açar; engellenirse aynı sekmeye düşer. */
function openWhatsApp(message: string) {
  const url = whatsappLink(message); // encodeURIComponent whatsappLink içinde
  const win = window.open(url, '_blank', 'noopener,noreferrer');
  if (!win) {
    // Pop-up engellendi — aynı sekmede aç
    window.location.href = url;
  }
}

function Field({
  label, name, type = 'text', required = false, placeholder,
}: {
  label: string; name: string; type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <label className="form-field">
      <span>{label}{required && ' *'}</span>
      <input name={name} type={type} required={required} placeholder={placeholder} />
    </label>
  );
}

function SelectField({
  label, name, options, required = false, emptyLabel = 'Seçiniz',
}: {
  label: string; name: string; options: readonly string[]; required?: boolean; emptyLabel?: string;
}) {
  return (
    <label className="form-field">
      <span>{label}{required && ' *'}</span>
      <select name={name} required={required} defaultValue="">
        <option value="" disabled={required}>{emptyLabel}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function SectionTitle({ no, title }: { no: string; title: string }) {
  return (
    <div className="form-section-head" data-reveal>
      <span className="form-section-no">{no}</span>
      <span className="form-section-title">{title}</span>
    </div>
  );
}

// ---------- Bağlı marka-model seçimi (QuoteForm + AppointmentForm ortak) ----------

/** Submit sırasında FormData'dan gerçek marka/model değerini çözer:
 *  "Diğer" seçildiyse kullanıcının elle yazdığı değer kullanılır. */
export function resolveVehicleFields(g: (k: string) => string): { brand: string; model: string } {
  const brandSel = g('brand');
  const modelSel = g('model');
  const brand = brandSel === OTHER_OPTION ? g('brandCustom') : brandSel;
  const model = brandSel === OTHER_OPTION || modelSel === OTHER_OPTION ? g('modelCustom') : modelSel;
  return { brand, model };
}

function VehicleBrandModelFields() {
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');

  const models = useMemo(
    () => vehicleBrands.find((b) => b.name === brand)?.models ?? [],
    [brand],
  );
  const brandIsOther = brand === OTHER_OPTION;
  const modelIsOther = model === OTHER_OPTION;

  return (
    <>
      <label className="form-field">
        <span>Araç Markası *</span>
        <select
          name="brand"
          required
          value={brand}
          onChange={(e) => {
            setBrand(e.target.value);
            setModel(''); // marka değişince önceki model sıfırlanır
          }}
        >
          <option value="" disabled>Marka seçiniz</option>
          {vehicleBrands.map((b) => <option key={b.name} value={b.name}>{b.name}</option>)}
        </select>
      </label>

      {!brandIsOther && (
        <label className="form-field">
          <span>Araç Modeli *</span>
          <select
            name="model"
            required
            value={model}
            disabled={brand === ''}
            aria-disabled={brand === ''}
            onChange={(e) => setModel(e.target.value)}
          >
            <option value="" disabled>
              {brand === '' ? 'Önce marka seçiniz' : 'Model seçiniz'}
            </option>
            {models.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
      )}

      {brandIsOther && (
        <Field label="Araç Markasını Yazınız" name="brandCustom" required placeholder="Örn. Hyundai" />
      )}
      {(brandIsOther || modelIsOther) && (
        <Field label="Araç Modelini Yazınız" name="modelCustom" required placeholder="Örn. Staria" />
      )}
    </>
  );
}

// ---------- İki seviyeli hizmet seçimi ----------

interface SelectedServices {
  categories: string[]; // doğrudan seçilen ana kategoriler
  items: Record<string, string[]>; // categoryId -> seçili alt hizmetler
}

const EMPTY_SELECTION: SelectedServices = { categories: [], items: {} };

function ServicePicker({
  selected,
  onToggleCategory,
  onToggleService,
}: {
  selected: SelectedServices;
  onToggleCategory: (categoryId: string) => void;
  onToggleService: (categoryId: string, item: string) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="svc-picker">
      {quoteServiceCategories.map((cat) => {
        const itemCount = selected.items[cat.id]?.length ?? 0;
        const catChecked = selected.categories.includes(cat.id);
        const indeterminate = !catChecked && itemCount > 0;
        const hasSelection = catChecked || itemCount > 0;
        const open = openId === cat.id;
        const panelId = `svc-panel-${cat.id}`;
        return (
          <div key={cat.id} className={`svc-cat${open ? ' open' : ''}${hasSelection ? ' has-selection' : ''}`}>
            <div className="svc-cat-head">
              <label className="svc-cat-select">
                <input
                  type="checkbox"
                  checked={catChecked}
                  ref={(el) => {
                    if (el) el.indeterminate = indeterminate;
                  }}
                  aria-label={`${cat.title} kategorisini talep et`}
                  onChange={() => onToggleCategory(cat.id)}
                />
                <span className="svc-cat-title">{cat.title}</span>
              </label>
              <span className="svc-cat-meta">
                {itemCount > 0 && <span className="svc-count">{itemCount} alt hizmet seçili</span>}
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
                  const checked = selected.items[cat.id]?.includes(item) ?? false;
                  return (
                    <label key={item} className={`svc-item${checked ? ' checked' : ''}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onToggleService(cat.id, item)}
                      />
                      <span>{item}</span>
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

/** Seçimlerden WhatsApp hizmet bloğu: kategori başlığı yalnızca BİR kez yazılır;
 *  yalnız kategori seçiliyse tek satır, alt hizmet varsa altına "–" ile listelenir. */
function buildServiceLines(selected: SelectedServices): string {
  return quoteServiceCategories
    .filter((cat) => selected.categories.includes(cat.id) || (selected.items[cat.id]?.length ?? 0) > 0)
    .map((cat) => {
      const items = selected.items[cat.id] ?? [];
      if (items.length === 0) return `• ${cat.title}`;
      return `• ${cat.title}\n${items.map((i) => `  – ${i}`).join('\n')}`;
    })
    .join('\n\n');
}

// ---------- Teklif formu ----------

export function QuoteForm() {
  const [sent, setSent] = useState(false);
  const [selected, setSelected] = useState<SelectedServices>(EMPTY_SELECTION);
  const [serviceError, setServiceError] = useState<string | null>(null);

  const toggleCategory = (categoryId: string) => {
    setServiceError(null);
    setSelected((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter((c) => c !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  const toggleService = (categoryId: string, item: string) => {
    setServiceError(null);
    setSelected((prev) => {
      const current = prev.items[categoryId] ?? [];
      const next = current.includes(item)
        ? current.filter((i) => i !== item)
        : [...current, item];
      const items = { ...prev.items, [categoryId]: next };
      if (next.length === 0) delete items[categoryId];
      return { ...prev, items };
    });
  };

  const categoryCount = selected.categories.length;
  const itemCount = useMemo(
    () => Object.values(selected.items).reduce((sum, items) => sum + items.length, 0),
    [selected.items],
  );
  const hasAnySelection = categoryCount > 0 || itemCount > 0;
  const showOtherInput = useMemo(
    () => Object.values(selected.items).some((items) => items.includes(OTHER_OPTION)),
    [selected.items],
  );

  const selectionSummary = useMemo(() => {
    if (!hasAnySelection) return null;
    const parts: string[] = [];
    if (categoryCount > 0) parts.push(`${categoryCount} kategori`);
    if (itemCount > 0) parts.push(`${itemCount} alt hizmet`);
    return `${parts.join(', ')} seçildi`;
  }, [hasAnySelection, categoryCount, itemCount]);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!hasAnySelection) {
      setServiceError('Lütfen en az bir hizmet veya hizmet kategorisi seçin.');
      return;
    }
    const f = new FormData(e.currentTarget);
    const g = (k: string) => String(f.get(k) ?? '').trim();
    const { brand, model } = resolveVehicleFields(g);

    const otherNote = g('serviceOther');
    const messageText = g('message');

    const parts: Array<string | null> = [
      '*MYDIAMONDVIP | FİYAT TEKLİFİ TALEBİ*',
      bulletSection('Müşteri Bilgileri', [
        ['Ad Soyad', g('name')],
        ['Telefon', g('phone')],
        ['E-posta', g('email')],
        ['Şehir', g('city')],
      ]),
      bulletSection('Araç Bilgileri', [
        ['Marka', brand],
        ['Model', model],
        ['Model Yılı', g('year')],
        ['Şasi / Uzunluk', g('chassis')],
        ['Kullanım Amacı', g('purpose')],
      ]),
      `*Talep Edilen Hizmetler*\n\n${buildServiceLines(selected)}`,
      otherNote ? `*Diğer Hizmet Açıklaması*\n${otherNote}` : null,
      bulletSection('Proje Bilgileri', [
        ['Bütçe Aralığı', g('budget')],
        ['Teslim Beklentisi', g('deadline')],
      ]),
      messageText ? `*Proje Notu*\n${messageText}` : null,
      'Kaynak: mydiamondvip.com/teklif-formu',
    ];

    openWhatsApp(parts.filter(Boolean).join('\n\n'));
    setSent(true);
  };

  return (
    <form className="form" onSubmit={submit}>
      <SectionTitle no="01" title="İletişim Bilgileri" />
      <div className="form-grid">
        <Field label="Ad Soyad" name="name" required />
        <Field label="Telefon" name="phone" type="tel" required placeholder="05xx xxx xx xx" />
        <Field label="E-posta" name="email" type="email" />
        <Field label="Şehir" name="city" placeholder="İstanbul" />
      </div>

      <SectionTitle no="02" title="Araç Bilgileri" />
      <div className="form-grid">
        <VehicleBrandModelFields />
        <Field label="Model Yılı" name="year" placeholder="Örn. 2023" />
        <SelectField label="Şasi / Uzunluk Tipi" name="chassis" options={chassisTypes} emptyLabel="Seçiniz (opsiyonel)" />
        <SelectField label="Kullanım Amacı" name="purpose" options={usagePurposes} emptyLabel="Seçiniz (opsiyonel)" />
      </div>

      <SectionTitle no="03" title="Proje ve Hizmet Bilgileri" />
      <div className="form-field" style={{ marginBottom: 22 }}>
        <span>Talep Edilen Hizmetler *{selectionSummary && ` — ${selectionSummary}`}</span>
      </div>
      <ServicePicker
        selected={selected}
        onToggleCategory={toggleCategory}
        onToggleService={toggleService}
      />
      {showOtherInput && (
        <label className="form-field" style={{ marginTop: 18 }}>
          <span>Diğer — kısa açıklama</span>
          <input name="serviceOther" placeholder="Talep ettiğiniz özel uygulamayı kısaca yazın" />
        </label>
      )}
      {serviceError && (
        <p className="form-error" role="alert">{serviceError}</p>
      )}
      <p className="note" style={{ marginTop: 14 }}>
        Uygulanabilirlik; araç modeli, şasi ölçüsü ve mevcut teknik altyapı incelendikten sonra kesinleştirilir.
      </p>

      <div className="form-grid" style={{ marginTop: 10 }}>
        <label className="form-field">
          <span>Bütçe Aralığı</span>
          <select name="budget" defaultValue="">
            <option value="">Belirtmek istemiyorum</option>
            <option>250.000 TL altı</option>
            <option>250.000 – 750.000 TL</option>
            <option>750.000 – 1.500.000 TL</option>
            <option>1.500.000 TL üzeri</option>
          </select>
        </label>
        <Field label="Teslim Beklentisi" name="deadline" placeholder="Örn. 2 ay içinde" />
      </div>
      <label className="form-field">
        <span>Proje Detayları / Mesaj</span>
        <textarea name="message" rows={5} placeholder="Projenizle ilgili beklentilerinizi kısaca anlatın" />
      </label>
      <button className="cta cta-primary" type="submit">Teklif Talebini WhatsApp&apos;tan Gönder</button>
      {sent && (
        <p className="form-success" role="status">
          Teklif talebiniz WhatsApp mesajı olarak hazırlandı. Açılan sohbette Gönder butonuna basmanız yeterli.
          Dilerseniz <a href={contact.phoneHref}>{contact.phoneDisplay}</a> numaralı sabit hattımızdan da bize ulaşabilirsiniz.
        </p>
      )}
    </form>
  );
}

// ---------- Randevu formu ----------

export function AppointmentForm() {
  const [sent, setSent] = useState(false);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const g = (k: string) => String(f.get(k) ?? '').trim();
    const { brand, model } = resolveVehicleFields(g);
    const note = g('message');

    const parts: Array<string | null> = [
      '*MYDIAMONDVIP | RANDEVU TALEBİ*',
      bulletSection('Müşteri Bilgileri', [
        ['Ad Soyad', g('name')],
        ['Telefon', g('phone')],
      ]),
      bulletSection('Araç Bilgileri', [
        ['Marka', brand],
        ['Model', model],
      ]),
      bulletSection('Randevu Bilgileri', [
        ['Görüşme Tipi', g('type')],
        ['Tercih Edilen Tarih', g('date')],
      ]),
      note ? `*Not*\n${note}` : null,
      'Kaynak: mydiamondvip.com/randevu-talebi',
    ];

    openWhatsApp(parts.filter(Boolean).join('\n\n'));
    setSent(true);
  };

  return (
    <form className="form" onSubmit={submit}>
      <div className="form-grid">
        <Field label="Ad Soyad" name="name" required />
        <Field label="Telefon" name="phone" type="tel" required placeholder="05xx xxx xx xx" />
        <VehicleBrandModelFields />
        <label className="form-field">
          <span>Görüşme Tipi *</span>
          <select name="type" required defaultValue="">
            <option value="" disabled>Seçiniz</option>
            <option>Atölyede yüz yüze</option>
            <option>Telefon görüşmesi</option>
            <option>Video görüşme</option>
          </select>
        </label>
        <Field label="Tercih Edilen Tarih" name="date" type="date" />
      </div>
      <label className="form-field">
        <span>Mesaj</span>
        <textarea name="message" rows={4} placeholder="Görüşmek istediğiniz konuyu kısaca yazın" />
      </label>
      <button className="cta cta-primary" type="submit">WhatsApp ile Randevu Talep Et</button>
      {sent && (
        <p className="form-success" role="status">
          Randevu talebiniz WhatsApp mesajı olarak hazırlandı. Açılan sohbette Gönder butonuna basmanız yeterli.
        </p>
      )}
    </form>
  );
}
