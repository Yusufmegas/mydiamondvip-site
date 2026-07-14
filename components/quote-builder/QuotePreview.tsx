'use client';

// Canlı A4 önizleme — gerçek sayfalara bölünür (tek uzun sayfa A4'e
// küçültülmez). Ekranda genişliğe ölçeklenir; export doğal ölçüyü kullanır.
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from 'react';
import { brand } from '@/data/brand';
import { contact } from '@/data/contact';
import type { QuoteDraft, SelectedOfferService } from '@/lib/quote-demo/types';
import {
  resolveDraftVehicle,
  parseAmount,
  formatAmountTR,
  formatDateTR,
} from '@/lib/quote-demo/types';
import { QuotePreviewPage } from './QuotePreviewPage';

// ---- Sayfalama: açıklama uzunluğuna göre satır ağırlığı hesaplanır ----
// Bir hizmet sayfasının tablo kapasitesi yaklaşık satır-birimi cinsinden.
const PAGE_LINE_CAPACITY = 30;
const DESC_CHARS_PER_LINE = 68;
const TITLE_CHARS_PER_LINE = 26;

function rowWeight(s: SelectedOfferService): number {
  const descLines = Math.max(1, Math.ceil(s.description.length / DESC_CHARS_PER_LINE));
  const titleLines = Math.max(1, Math.ceil(s.title.length / TITLE_CHARS_PER_LINE));
  return Math.max(descLines, titleLines) + 0.6; // satır içi boşluk payı
}

/** Hizmetleri satır ağırlığına göre sayfalara böler; satır asla bölünmez. */
function chunkServices(services: SelectedOfferService[]): SelectedOfferService[][] {
  const chunks: SelectedOfferService[][] = [];
  let current: SelectedOfferService[] = [];
  let used = 0;
  for (const s of services) {
    const w = rowWeight(s);
    if (current.length > 0 && used + w > PAGE_LINE_CAPACITY) {
      chunks.push(current);
      current = [];
      used = 0;
    }
    current.push(s);
    used += w;
  }
  if (current.length > 0) chunks.push(current);
  return chunks;
}

function InfoRow({ k, v }: { k: string; v: string }) {
  if (!v.trim()) return null;
  return (
    <div className="qa-info-row">
      <span className="k">{k}</span>
      <span className="v">{v}</span>
    </div>
  );
}

function priceLines(draft: QuoteDraft): { main: string; note: string } {
  const parsed = parseAmount(draft.price.amount);
  const amountText = parsed !== null ? formatAmountTR(parsed) : '—';
  const base = `${amountText} ${draft.price.currency}`;
  switch (draft.price.vat) {
    case 'KDV Hariç':
      return { main: `${base} + KDV`, note: '' };
    case 'KDV Dahil':
      return { main: base, note: 'KDV dahildir.' };
    default:
      return { main: base, note: 'KDV uygulanmayacaktır.' };
  }
}

export function QuotePreview({
  draft,
  pagesRef,
}: {
  draft: QuoteDraft;
  pagesRef: React.RefObject<HTMLDivElement | null>;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [naturalHeight, setNaturalHeight] = useState(0);

  const sortedServices = [...draft.services].sort((a, b) => a.sortOrder - b.sortOrder);
  const serviceChunks = chunkServices(sortedServices);
  const pageCount = 1 + serviceChunks.length + 1; // özet + hizmet sayfaları + koşullar

  // Ekrana ölçekleme — A4 210mm ≈ 794px @96dpi
  useEffect(() => {
    const frame = frameRef.current;
    const wrap = pagesRef.current;
    if (!frame || !wrap) return;
    const A4_PX = 794;
    const update = () => {
      const w = frame.clientWidth;
      const s = Math.min(1, w / A4_PX);
      setScale(s);
      setNaturalHeight(wrap.scrollHeight);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(frame);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [pagesRef, draft]);

  const vehicle = resolveDraftVehicle(draft.vehicle);
  const price = priceLines(draft);
  const paymentFirstLine = draft.terms.payment.split('\n')[0]?.trim() ?? '';

  return (
    <div className="qd-preview-scroll">
      <div className="qd-a4-frame" ref={frameRef} style={{ height: naturalHeight * scale }}>
        <div
          className="qd-preview-scale-wrap"
          ref={pagesRef}
          style={{ transform: `scale(${scale})` }}
        >
          {/* ---------- SAYFA 1 — Teklif özeti ---------- */}
          <div className="quote-a4-page">
            <div className="qa-head">
              <img src={brand.logo} alt="MyDiamondVIP" className="qa-logo" />
              <div className="qa-head-right">
                <div className="qa-doc-title">FİYAT TEKLİFİ</div>
                <div className="qa-meta">
                  Teklif No: <strong>{draft.quoteNumber || '—'}</strong>
                  <br />
                  Teklif Tarihi: <strong>{formatDateTR(draft.quoteDate) || '—'}</strong>
                  {draft.validUntil && (
                    <>
                      <br />
                      Geçerlilik: <strong>{formatDateTR(draft.validUntil)}</strong>
                    </>
                  )}
                </div>
              </div>
            </div>
            <hr className="qa-rule" />

            {draft.title.trim() && (
              <p style={{ fontSize: '11pt', marginBottom: 14, color: '#2a2724' }}>{draft.title}</p>
            )}

            <div className="qa-cols">
              <div>
                <p className="qa-section-title">Müşteri Bilgileri</p>
                <InfoRow k="Müşteri" v={draft.customer.name} />
                <InfoRow k="Yetkili" v={draft.customer.contactPerson} />
                <InfoRow k="Telefon" v={draft.customer.phone} />
                <InfoRow k="E-posta" v={draft.customer.email} />
                <InfoRow k="Adres" v={draft.customer.address} />
                <InfoRow k="Vergi D." v={draft.customer.taxOffice} />
                <InfoRow k="Vergi No" v={draft.customer.taxNumber} />
              </div>
              <div>
                <p className="qa-section-title">Araç Bilgileri</p>
                <InfoRow k="Marka" v={vehicle.brand} />
                <InfoRow k="Model" v={vehicle.model} />
                <InfoRow k="Model Yılı" v={draft.vehicle.year} />
                <InfoRow k="Şasi" v={draft.vehicle.chassis} />
                <InfoRow k="Plaka" v={draft.vehicle.plate} />
                <InfoRow k="Araç Adedi" v={draft.vehicle.count} />
                <InfoRow k="Kullanım" v={draft.vehicle.purpose} />
              </div>
            </div>

            {draft.vehicle.projectNote.trim() && (
              <>
                <hr className="qa-rule-soft" />
                <p className="qa-section-title">Proje Açıklaması</p>
                <p style={{ fontSize: '9.5pt', color: '#2a2724' }}>{draft.vehicle.projectNote}</p>
              </>
            )}

            <div className="qa-price-block">
              <p className="qa-price-label">Toplam Araç Dizayn Fiyatı</p>
              <p className="qa-price-value">{price.main}</p>
              {price.note && <p className="qa-price-note">{price.note}</p>}
            </div>
            <div className="qa-summary-row">
              <span>{sortedServices.length} kalem hizmet</span>
              {draft.terms.delivery.trim() && <span>Teslim: {draft.terms.delivery}</span>}
              {paymentFirstLine && <span>{paymentFirstLine}</span>}
            </div>

            <div className="qa-footer" style={{ marginTop: 16 }}>
              <div>
                {contact.address}
                <br />
                {contact.postalCode} {contact.district} / {contact.city}
              </div>
              <div className="right">
                {contact.phoneDisplay} · {contact.whatsappDisplay}
                <br />
                {contact.email} · mydiamondvip.com
              </div>
            </div>
            <span className="qa-page-no">Sayfa 1 / {pageCount}</span>
          </div>

          {/* ---------- HİZMET SAYFALARI ---------- */}
          {serviceChunks.map((chunk, ci) => {
            // Global sıra numarası için önceki chunk'ların toplamı
            const offset = serviceChunks.slice(0, ci).reduce((n, c) => n + c.length, 0);
            return (
              <QuotePreviewPage
                key={`svc-${ci}`}
                pageNo={2 + ci}
                pageCount={pageCount}
                quoteNumber={draft.quoteNumber}
                compactHeader
              >
                <p className="qa-section-title" style={{ fontSize: '10pt', marginBottom: 12 }}>
                  Detaylı Dizayn Listesi
                </p>
                <table className="qa-table">
                  <thead>
                    <tr>
                      <th className="num">No</th>
                      <th className="svc">Hizmet</th>
                      <th className="desc">Açıklama</th>
                      <th className="qty">Adet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chunk.map((s, i) => (
                      <tr key={s.id}>
                        <td className="num">{offset + i + 1}</td>
                        <td className="svc">{s.title}</td>
                        <td className="desc">{s.description}</td>
                        <td className="qty">{s.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ marginTop: 'auto' }} />
              </QuotePreviewPage>
            );
          })}

          {/* ---------- SON SAYFA — Ticari koşullar + imza ---------- */}
          <QuotePreviewPage
            pageNo={pageCount}
            pageCount={pageCount}
            quoteNumber={draft.quoteNumber}
            compactHeader
          >
            <p className="qa-section-title" style={{ fontSize: '10pt', marginBottom: 14 }}>
              Ticari Koşullar
            </p>
            {draft.terms.payment.trim() && (
              <div className="qa-term">
                <h4>Ödeme Planı</h4>
                <p>{draft.terms.payment}</p>
              </div>
            )}
            {draft.terms.delivery.trim() && (
              <div className="qa-term">
                <h4>Teslim Süresi</h4>
                <p>{draft.terms.delivery}</p>
              </div>
            )}
            {draft.terms.warranty.trim() && (
              <div className="qa-term">
                <h4>Garanti</h4>
                <p>{draft.terms.warranty}</p>
              </div>
            )}
            <div className="qa-term">
              <h4>KDV Durumu</h4>
              <p>{draft.price.vat}</p>
            </div>
            {draft.terms.validity.trim() && (
              <div className="qa-term">
                <h4>Teklif Geçerliliği</h4>
                <p>{draft.terms.validity}</p>
              </div>
            )}
            {draft.terms.notes.trim() && (
              <div className="qa-term">
                <h4>Ek Notlar</h4>
                <p>{draft.terms.notes}</p>
              </div>
            )}

            <div className="qa-signatures">
              <div className="qa-sign-box">
                <p className="t">MyDiamondVIP Yetkilisi</p>
                <p className="l">Ad Soyad</p>
                <p className="l">İmza / Kaşe</p>
              </div>
              <div className="qa-sign-box">
                <p className="t">Müşteri</p>
                <p className="l">Ad Soyad</p>
                <p className="l">İmza</p>
              </div>
            </div>
          </QuotePreviewPage>
        </div>
      </div>
    </div>
  );
}
