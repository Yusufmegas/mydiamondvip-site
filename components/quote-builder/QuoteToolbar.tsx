'use client';

import Image from 'next/image';
import { brand } from '@/data/brand';

export function QuoteToolbar({
  onNewQuote,
  onClearDraft,
  onExportPdf,
  onExportJpeg,
  onLogout,
  exporting,
}: {
  onNewQuote: () => void;
  onClearDraft: () => void;
  onExportPdf: () => void;
  onExportJpeg: () => void;
  onLogout: () => void;
  exporting: 'pdf' | 'jpeg' | null;
}) {
  return (
    <div className="qd-toolbar">
      <div className="qd-toolbar-brand">
        <Image
          src={brand.logo}
          alt="MyDiamondVIP"
          width={brand.logoWidth}
          height={brand.logoHeight}
          priority
          className="qd-toolbar-logo"
        />
        <span className="qd-toolbar-title">Teklif Hazırlama</span>
        <span className="qd-demo-badge">Demo</span>
      </div>
      <div className="qd-toolbar-actions">
        <button type="button" className="qd-btn" onClick={onNewQuote}>Yeni Teklif</button>
        <button type="button" className="qd-btn" onClick={onClearDraft}>Taslağı Temizle</button>
        <button
          type="button"
          className="qd-btn qd-btn-primary"
          onClick={onExportPdf}
          disabled={exporting !== null}
        >
          {exporting === 'pdf' ? 'PDF hazırlanıyor…' : 'PDF İndir'}
        </button>
        <button
          type="button"
          className="qd-btn qd-btn-primary"
          onClick={onExportJpeg}
          disabled={exporting !== null}
        >
          {exporting === 'jpeg' ? 'JPEG hazırlanıyor…' : 'JPEG İndir'}
        </button>
        <button type="button" className="qd-btn" onClick={onLogout}>Çıkış Yap</button>
      </div>
    </div>
  );
}
