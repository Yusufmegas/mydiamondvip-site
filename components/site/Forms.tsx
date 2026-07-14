'use client';

// Teklif ve randevu formları. Sunucu tarafı olmadığı için gönderim,
// alanlardan derlenen mesajla WhatsApp'a (tek tıkla) aktarılır.
// Hedef numara HER ZAMAN data/contact.ts üzerinden alınır.

import { useMemo, useState, type FormEvent } from 'react';
import { contact, whatsappLink } from '@/data/contact';
import {
  quoteServiceCategories,
  vehicleTypes,
  chassisTypes,
  usagePurposes,
} from '@/data/quoteServices';

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

// ---------- İki seviyeli hizmet seçimi ----------

type SelectedServices = Record<string, string[]>; // categoryId -> seçili alt hizmetler

function ServicePicker({
  selected,
  onToggle,
}: {
  selected: SelectedServices;
  onToggle: (categoryId: string, item: string) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="svc-picker">
      {quoteServiceCategories.map((cat) => {
        const count = selected[cat.id]?.length ?? 0;
        const open = openId === cat.id;
        const panelId = `svc-panel-${cat.id}`;
        return (
          <div key={cat.id} className={`svc-cat${open ? ' open' : ''}${count > 0 ? ' has-selection' : ''}`}>
            <button
              type="button"
              className="svc-cat-head"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpenId(open ? null : cat.id)}
            >
              <span className="svc-cat-title">{cat.title}</span>
              <span className="svc-cat-meta">
                {count > 0 && <span className="svc-count">{count} seçili</span>}
                <span className="svc-chevron" aria-hidden="true">{open ? '−' : '+'}</span>
              </span>
            </button>
            {open && (
              <div id={panelId} className="svc-items" role="group" aria-label={`${cat.title} alt hizmetleri`}>
                {cat.items.map((item) => {
                  const checked = selected[cat.id]?.includes(item) ?? false;
                  return (
                    <label key={item} className={`svc-item${checked ? ' checked' : ''}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onToggle(cat.id, item)}
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

// ---------- Teklif formu ----------

export function QuoteForm() {
  const [sent, setSent] = useState(false);
  const [selected, setSelected] = useState<SelectedServices>({});
  const [serviceError, setServiceError] = useState<string | null>(null);

  const toggleService = (categoryId: string, item: string) => {
    setServiceError(null);
    setSelected((prev) => {
      const current = prev[categoryId] ?? [];
      const next = current.includes(item)
        ? current.filter((i) => i !== item)
        : [...current, item];
      const copy = { ...prev, [categoryId]: next };
      if (next.length === 0) delete copy[categoryId];
      return copy;
    });
  };

  const totalSelected = useMemo(
    () => Object.values(selected).reduce((sum, items) => sum + items.length, 0),
    [selected],
  );
  const showOtherInput = useMemo(
    () => Object.values(selected).some((items) => items.includes('Diğer')),
    [selected],
  );

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (totalSelected === 0) {
      setServiceError('Lütfen en az bir hizmet seçin.');
      return;
    }
    const f = new FormData(e.currentTarget);
    const g = (k: string) => String(f.get(k) ?? '').trim();

    // Seçilen hizmetler — yalnızca seçili kategoriler, kategori sırasıyla
    const serviceLines = quoteServiceCategories
      .filter((cat) => (selected[cat.id]?.length ?? 0) > 0)
      .map((cat) => {
        const items = selected[cat.id].map((i) => `  – ${i}`).join('\n');
        return `• ${cat.title}\n${items}`;
      })
      .join('\n\n');

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
        ['Araç Türü', g('vehicleType')],
        ['Marka', g('brand')],
        ['Model', g('model')],
        ['Model Yılı', g('year')],
        ['Şasi / Uzunluk', g('chassis')],
        ['Kullanım Amacı', g('purpose')],
      ]),
      `*Talep Edilen Hizmetler*\n\n${serviceLines}`,
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
        <SelectField label="Araç Türü" name="vehicleType" options={vehicleTypes} required />
        <Field label="Araç Markası" name="brand" required placeholder="Mercedes-Benz, Volkswagen…" />
        <Field label="Araç Modeli" name="model" required placeholder="Vito, Sprinter, Crafter…" />
        <Field label="Model Yılı" name="year" placeholder="Örn. 2023" />
        <SelectField label="Şasi / Uzunluk Tipi" name="chassis" options={chassisTypes} emptyLabel="Seçiniz (opsiyonel)" />
        <SelectField label="Kullanım Amacı" name="purpose" options={usagePurposes} emptyLabel="Seçiniz (opsiyonel)" />
      </div>

      <SectionTitle no="03" title="Proje ve Hizmet Bilgileri" />
      <div className="form-field" style={{ marginBottom: 22 }}>
        <span>Talep Edilen Hizmetler *{totalSelected > 0 && ` — ${totalSelected} hizmet seçildi`}</span>
      </div>
      <ServicePicker selected={selected} onToggle={toggleService} />
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
    const note = g('message');

    const parts: Array<string | null> = [
      '*MYDIAMONDVIP | RANDEVU TALEBİ*',
      bulletSection('Müşteri Bilgileri', [
        ['Ad Soyad', g('name')],
        ['Telefon', g('phone')],
      ]),
      bulletSection('Araç Bilgileri', [
        ['Araç Türü', g('vehicleType')],
        ['Araç Modeli', g('model')],
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
        <SelectField label="Araç Türü" name="vehicleType" options={vehicleTypes} required />
        <Field label="Araç Modeli" name="model" required placeholder="Örn. Mercedes Vito Tourer" />
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
