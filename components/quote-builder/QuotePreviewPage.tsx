'use client';

// Tek A4 sayfası — export sırasında her .quote-a4-page ayrı sayfa olur.
// Baskı tasarımı: açık zemin, koyu metin, gold çizgiler.
/* eslint-disable @next/next/no-img-element -- export (html-to-image) için
   optimize edilmemiş doğrudan <img> gerekir; next/image proxy URL'si
   canvas'a alınırken sorun çıkarabilir. */
import { brand } from '@/data/brand';
import { contact } from '@/data/contact';

export function QuotePreviewPage({
  pageNo,
  pageCount,
  quoteNumber,
  compactHeader,
  children,
}: {
  pageNo: number;
  pageCount: number;
  quoteNumber: string;
  compactHeader?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="quote-a4-page">
      {compactHeader && (
        <>
          <div className="qa-head" style={{ alignItems: 'center' }}>
            <img src={brand.logo} alt="MyDiamondVIP" className="qa-logo-sm" />
            <div className="qa-meta">Teklif No: <strong>{quoteNumber}</strong></div>
          </div>
          <hr className="qa-rule-thin" />
        </>
      )}
      {children}
      <div className="qa-footer">
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
      <span className="qa-page-no">Sayfa {pageNo} / {pageCount}</span>
    </div>
  );
}
