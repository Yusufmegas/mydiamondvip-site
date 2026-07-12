'use client';

// Film kapısı (spec §3): bölüm-içi siyah perde + logo + ince progress çizgisi.
// İlk 96 kare hazır olunca kalkar; arka plan dolgusu devam eder.

export default function Gate({ progress, open }: { progress: number; open: boolean }) {
  return (
    <div className={`gate${open ? ' gate-lift' : ''}`} aria-hidden={open}>
      <div className="gate-inner">
        <div className="brand-mark gate-logo">MYDIAMOND<span>VIP</span></div>
        <div className="gate-track">
          <div className="gate-bar" style={{ transform: `scaleX(${Math.min(1, progress)})` }} />
        </div>
        <div className="gate-hint">VIP Araç Tasarımı</div>
      </div>
    </div>
  );
}
