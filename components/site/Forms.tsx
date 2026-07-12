'use client';

// Teklif ve randevu formları. Sunucu tarafı olmadığı için gönderim,
// alanlardan derlenen mesajla WhatsApp'a (tek tıkla) aktarılır;
// e-posta alternatifi de sunulur. Backend eklendiğinde yalnızca submit değişir.

import { useState, type FormEvent } from 'react';
import { contact, whatsappLink } from '@/data/contact';
import { services } from '@/data/services';

function openWhatsApp(lines: Array<[string, string]>, heading: string) {
  const body = lines
    .filter(([, v]) => v.trim() !== '')
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
  window.open(whatsappLink(`${heading}\n\n${body}`), '_blank', 'noopener');
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

export function QuoteForm() {
  const [sent, setSent] = useState(false);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const g = (k: string) => String(f.get(k) ?? '');
    openWhatsApp(
      [
        ['Ad Soyad', g('name')],
        ['Telefon', g('phone')],
        ['E-posta', g('email')],
        ['Araç Markası', g('brand')],
        ['Araç Modeli', g('model')],
        ['Talep Edilen Hizmet', g('service')],
        ['Kullanım Amacı', g('purpose')],
        ['Bütçe Aralığı', g('budget')],
        ['Teslim Beklentisi', g('deadline')],
        ['Mesaj', g('message')],
      ],
      'Teklif Talebi — mydiamondvip.com',
    );
    setSent(true);
  };

  return (
    <form className="form" onSubmit={submit}>
      <div className="form-grid">
        <Field label="Ad Soyad" name="name" required />
        <Field label="Telefon" name="phone" type="tel" required placeholder="05xx xxx xx xx" />
        <Field label="E-posta" name="email" type="email" />
        <Field label="Araç Markası" name="brand" required placeholder="Mercedes, Volkswagen…" />
        <Field label="Araç Modeli" name="model" required placeholder="Vito, Sprinter, V-Class…" />
        <label className="form-field">
          <span>Talep Edilen Hizmet *</span>
          <select name="service" required defaultValue="">
            <option value="" disabled>Seçiniz</option>
            {services.map((s) => <option key={s.slug} value={s.title}>{s.title}</option>)}
            <option value="Diğer">Diğer</option>
          </select>
        </label>
        <Field label="Kullanım Amacı" name="purpose" placeholder="Aile, yönetici, turizm/transfer…" />
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
        <span>Mesaj</span>
        <textarea name="message" rows={5} placeholder="Projenizle ilgili beklentilerinizi kısaca anlatın" />
      </label>
      <p className="note">
        Görsel paylaşmak isterseniz: form gönderiminde açılan WhatsApp sohbetine araç fotoğraflarınızı
        ekleyebilir veya <a href={contact.emailHref}>{contact.email}</a> adresine iletebilirsiniz.
      </p>
      <button className="cta cta-primary" type="submit">WhatsApp ile Gönder</button>
      {sent && (
        <p className="form-success" role="status">
          Talebiniz WhatsApp mesajı olarak hazırlandı — açılan sohbette “Gönder”e basmanız yeterli.
          Dilerseniz <a href={contact.phoneHref}>{contact.phone}</a> numarasından bize doğrudan ulaşabilirsiniz.
        </p>
      )}
    </form>
  );
}

export function AppointmentForm() {
  const [sent, setSent] = useState(false);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const g = (k: string) => String(f.get(k) ?? '');
    openWhatsApp(
      [
        ['Ad Soyad', g('name')],
        ['Telefon', g('phone')],
        ['Araç Modeli', g('model')],
        ['Görüşme Tipi', g('type')],
        ['Tercih Edilen Tarih', g('date')],
        ['Mesaj', g('message')],
      ],
      'Randevu Talebi — mydiamondvip.com',
    );
    setSent(true);
  };

  return (
    <form className="form" onSubmit={submit}>
      <div className="form-grid">
        <Field label="Ad Soyad" name="name" required />
        <Field label="Telefon" name="phone" type="tel" required placeholder="05xx xxx xx xx" />
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
          Randevu talebiniz WhatsApp mesajı olarak hazırlandı — sohbette “Gönder”e basmanız yeterli.
        </p>
      )}
    </form>
  );
}
