'use client';

// Teklif hazırlama demo paneli — DB yok; taslak versioned localStorage'da
// tutulur. Hydration güvenliği: taslak yalnızca mount SONRASI yüklenir.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { offerServiceCategories } from '@/data/offerServices';
import type { QuoteDraft, SelectedOfferService } from '@/lib/quote-demo/types';
import {
  DRAFT_STORAGE_KEY,
  COUNTER_STORAGE_KEY,
  createDefaultDraft,
  resolveDraftVehicle,
  parseAmount,
} from '@/lib/quote-demo/types';
import { exportPdf, exportJpeg, safeSlug } from '@/lib/quote-demo/export';
import { QuoteToolbar } from './QuoteToolbar';
import { QuoteGeneralFields } from './QuoteGeneralFields';
import { QuoteCustomerFields } from './QuoteCustomerFields';
import { QuoteVehicleFields } from './QuoteVehicleFields';
import { OfferServicePicker } from './OfferServicePicker';
import { SelectedServicesEditor } from './SelectedServicesEditor';
import { QuotePriceFields } from './QuotePriceFields';
import { QuoteCommercialTerms } from './QuoteCommercialTerms';
import { QuotePreview } from './QuotePreview';

function SectionTitle({ no, title }: { no: string; title: string }) {
  return (
    <div className="form-section-head">
      <span className="form-section-no">{no}</span>
      <span className="form-section-title">{title}</span>
    </div>
  );
}

/** MDV-YYYY-NNN — sayaç localStorage'da tutulur. */
function nextQuoteNumber(increment: boolean): string {
  const year = new Date().getFullYear();
  let counter = 1;
  try {
    const raw = localStorage.getItem(COUNTER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { year?: number; counter?: number };
      if (parsed.year === year && typeof parsed.counter === 'number') {
        counter = increment ? parsed.counter + 1 : parsed.counter;
      }
    }
    if (increment || !raw) {
      localStorage.setItem(COUNTER_STORAGE_KEY, JSON.stringify({ year, counter }));
    }
  } catch {
    // localStorage erişilemezse varsayılan numara kullanılır
  }
  return `MDV-${year}-${String(counter).padStart(3, '0')}`;
}

export function QuoteBuilder() {
  const router = useRouter();
  const [draft, setDraft] = useState<QuoteDraft | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<'pdf' | 'jpeg' | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const pagesRef = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Taslak yükleme — yalnızca client'ta (hydration güvenli)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as QuoteDraft;
        if (parsed && typeof parsed.quoteNumber === 'string' && Array.isArray(parsed.services)) {
          setDraft(parsed);
          return;
        }
      }
    } catch {
      // bozuk taslak yok sayılır
    }
    setDraft(createDefaultDraft(nextQuoteNumber(false)));
  }, []);

  // Debounce'lu otomatik kayıt
  useEffect(() => {
    if (!draft) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      } catch {
        // kota dolarsa sessizce geç — demo kapsamı
      }
    }, 500);
    return () => clearTimeout(saveTimer.current);
  }, [draft]);

  const update = useCallback((patch: Partial<QuoteDraft>) => {
    setDraft((d) => (d ? { ...d, ...patch } : d));
  }, []);
  const updateCustomer = useCallback((patch: Partial<QuoteDraft['customer']>) => {
    setDraft((d) => (d ? { ...d, customer: { ...d.customer, ...patch } } : d));
  }, []);
  const updateVehicle = useCallback((patch: Partial<QuoteDraft['vehicle']>) => {
    setDraft((d) => (d ? { ...d, vehicle: { ...d.vehicle, ...patch } } : d));
  }, []);
  const updatePrice = useCallback((patch: Partial<QuoteDraft['price']>) => {
    setDraft((d) => (d ? { ...d, price: { ...d.price, ...patch } } : d));
  }, []);
  const updateTerms = useCallback((patch: Partial<QuoteDraft['terms']>) => {
    setDraft((d) => (d ? { ...d, terms: { ...d.terms, ...patch } } : d));
  }, []);

  // ---- Hizmet seçimi ----
  const selectedIds = useMemo(
    () => new Set((draft?.services ?? []).filter((s) => !s.isCustom).map((s) => s.id)),
    [draft?.services],
  );

  const addServiceItems = useCallback((categoryId: string, itemIds: string[]) => {
    setDraft((d) => {
      if (!d) return d;
      const cat = offerServiceCategories.find((c) => c.id === categoryId);
      if (!cat) return d;
      const existing = new Set(d.services.map((s) => s.id));
      let nextOrder = d.services.reduce((m, s) => Math.max(m, s.sortOrder), -1) + 1;
      const added: SelectedOfferService[] = [];
      for (const itemId of itemIds) {
        if (existing.has(itemId)) continue;
        const item = cat.items.find((i) => i.id === itemId);
        if (!item) continue;
        added.push({
          id: item.id,
          title: item.title,
          description: item.description,
          quantity: item.defaultQuantity,
          categoryId,
          isCustom: false,
          sortOrder: nextOrder++,
        });
      }
      return added.length ? { ...d, services: [...d.services, ...added] } : d;
    });
    setGeneralError(null);
  }, []);

  const removeServiceIds = useCallback((itemIds: string[]) => {
    const remove = new Set(itemIds);
    setDraft((d) => (d ? { ...d, services: d.services.filter((s) => !remove.has(s.id)) } : d));
  }, []);

  const toggleItem = useCallback(
    (categoryId: string, itemId: string) => {
      if (selectedIds.has(itemId)) removeServiceIds([itemId]);
      else addServiceItems(categoryId, [itemId]);
    },
    [selectedIds, addServiceItems, removeServiceIds],
  );

  // Kategori checkbox'ı: tümünü seç / tümünü kaldır (yalnızca firma paneli davranışı)
  const toggleCategory = useCallback(
    (categoryId: string, selectAll: boolean) => {
      const cat = offerServiceCategories.find((c) => c.id === categoryId);
      if (!cat) return;
      const ids = cat.items.map((i) => i.id);
      if (selectAll) addServiceItems(categoryId, ids);
      else removeServiceIds(ids);
    },
    [addServiceItems, removeServiceIds],
  );

  const updateService = useCallback(
    (id: string, patch: Partial<Pick<SelectedOfferService, 'quantity' | 'description'>>) => {
      setDraft((d) =>
        d
          ? { ...d, services: d.services.map((s) => (s.id === id ? { ...s, ...patch } : s)) }
          : d,
      );
    },
    [],
  );

  const moveService = useCallback((id: string, direction: -1 | 1) => {
    setDraft((d) => {
      if (!d) return d;
      const sorted = [...d.services].sort((a, b) => a.sortOrder - b.sortOrder);
      const idx = sorted.findIndex((s) => s.id === id);
      const swap = idx + direction;
      if (idx < 0 || swap < 0 || swap >= sorted.length) return d;
      [sorted[idx], sorted[swap]] = [sorted[swap], sorted[idx]];
      return { ...d, services: sorted.map((s, i) => ({ ...s, sortOrder: i })) };
    });
  }, []);

  const addCustomService = useCallback((title: string, description: string, quantity: number) => {
    setDraft((d) => {
      if (!d) return d;
      const nextOrder = d.services.reduce((m, s) => Math.max(m, s.sortOrder), -1) + 1;
      const custom: SelectedOfferService = {
        id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title,
        description,
        quantity,
        categoryId: 'custom',
        isCustom: true,
        sortOrder: nextOrder,
      };
      return { ...d, services: [...d.services, custom] };
    });
    setGeneralError(null);
  }, []);

  // ---- Yeni teklif / temizleme ----
  const resetDraft = useCallback((incrementCounter: boolean) => {
    if (!window.confirm('Mevcut teklif bilgileri silinecek. Devam etmek istiyor musunuz?')) return;
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // yoksay
    }
    setDraft(createDefaultDraft(nextQuoteNumber(incrementCounter)));
    setErrors({});
    setGeneralError(null);
    setExportError(null);
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/quote-demo/logout', { method: 'POST' });
    } finally {
      router.replace('/teklif-demo/giris');
      router.refresh();
    }
  }, [router]);

  // ---- Validation ----
  const validate = useCallback((): boolean => {
    if (!draft) return false;
    const e: Record<string, string> = {};
    if (!draft.quoteNumber.trim()) e.quoteNumber = 'Teklif numarası zorunludur.';
    if (!draft.quoteDate) e.quoteDate = 'Teklif tarihi zorunludur.';
    if (!draft.customer.name.trim()) e.customerName = 'Müşteri / firma adı zorunludur.';
    const vehicle = resolveDraftVehicle(draft.vehicle);
    if (!vehicle.brand.trim()) e.vehicleBrand = 'Araç markası zorunludur.';
    if (!vehicle.model.trim()) e.vehicleModel = 'Araç modeli zorunludur.';
    if (draft.services.length === 0) e.services = 'Lütfen en az bir hizmet seçin.';
    if (parseAmount(draft.price.amount) === null) {
      e.price = 'Lütfen toplam araç dizayn fiyatını girin.';
    }
    setErrors(e);
    if (Object.keys(e).length > 0) {
      setGeneralError('Teklifi oluşturmak için zorunlu alanları tamamlayın.');
      // İlk hatalı bölüme kaydır
      const sectionByKey: Record<string, string> = {
        quoteNumber: 'qd-sec-genel',
        quoteDate: 'qd-sec-genel',
        customerName: 'qd-sec-musteri',
        vehicleBrand: 'qd-sec-arac',
        vehicleModel: 'qd-sec-arac',
        services: 'qd-sec-hizmet',
        price: 'qd-sec-fiyat',
      };
      const firstKey = ['quoteNumber', 'quoteDate', 'customerName', 'vehicleBrand', 'vehicleModel', 'services', 'price']
        .find((k) => e[k]);
      if (firstKey) {
        document.getElementById(sectionByKey[firstKey])?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return false;
    }
    setGeneralError(null);
    return true;
  }, [draft]);

  // ---- Export ----
  const collectPages = (): HTMLElement[] =>
    Array.from(pagesRef.current?.querySelectorAll<HTMLElement>('.quote-a4-page') ?? []);

  const exportBaseName = (): string => {
    if (!draft) return 'teklif';
    const customer = safeSlug(draft.customer.name) || 'musteri';
    return `${safeSlug(draft.quoteNumber) || 'teklif'}-${customer}`;
  };

  const runExport = async (kind: 'pdf' | 'jpeg') => {
    if (!draft || exporting) return;
    setExportError(null);
    if (!validate()) return;
    const pages = collectPages();
    if (pages.length === 0) {
      setExportError('Önizleme oluşturulamadı. Sayfayı yenileyip tekrar deneyin.');
      return;
    }
    setExporting(kind);
    try {
      if (kind === 'pdf') await exportPdf(pages, exportBaseName());
      else await exportJpeg(pages, exportBaseName(), draft.quoteNumber);
    } catch {
      setExportError('Dışa aktarma başarısız oldu. Lütfen tekrar deneyin.');
    } finally {
      setExporting(null);
    }
  };

  if (!draft) {
    return (
      <div className="qd-login">
        <p style={{ color: 'var(--cream-dim)' }}>Teklif taslağı yükleniyor…</p>
      </div>
    );
  }

  return (
    <>
      <QuoteToolbar
        onNewQuote={() => resetDraft(true)}
        onClearDraft={() => resetDraft(false)}
        onExportPdf={() => runExport('pdf')}
        onExportJpeg={() => runExport('jpeg')}
        onLogout={logout}
        exporting={exporting}
      />
      <div className="qd-layout">
        <div className="qd-form-col">
          <form className="form" onSubmit={(e) => e.preventDefault()}>
            {(generalError || exportError) && (
              <p className="qd-error-summary" role="alert">
                {generalError ?? exportError}
              </p>
            )}

            <SectionTitle no="01" title="Teklif Bilgileri" />
            <QuoteGeneralFields draft={draft} onChange={update} errors={errors} />

            <SectionTitle no="02" title="Müşteri Bilgileri" />
            <QuoteCustomerFields draft={draft} onChange={updateCustomer} errors={errors} />

            <SectionTitle no="03" title="Araç Bilgileri" />
            <QuoteVehicleFields draft={draft} onChange={updateVehicle} errors={errors} />

            <SectionTitle no="04" title="Hizmet Seçimi" />
            <div id="qd-sec-hizmet">
              <OfferServicePicker
                selectedIds={selectedIds}
                onToggleItem={toggleItem}
                onToggleCategory={toggleCategory}
              />
              {errors.services && (
                <p className="form-error" role="alert">{errors.services}</p>
              )}
            </div>

            <SectionTitle no="05" title="Seçilen Hizmetler" />
            <SelectedServicesEditor
              services={draft.services}
              onUpdate={updateService}
              onRemove={(id) => removeServiceIds([id])}
              onMove={moveService}
              onAddCustom={addCustomService}
            />

            <SectionTitle no="06" title="Toplam Teklif" />
            <QuotePriceFields draft={draft} onChange={updatePrice} errors={errors} />

            <SectionTitle no="07" title="Ticari Koşullar" />
            <QuoteCommercialTerms draft={draft} onChange={updateTerms} />
          </form>
        </div>
        <div className="qd-preview-col">
          <QuotePreview draft={draft} pagesRef={pagesRef} />
        </div>
      </div>
    </>
  );
}
