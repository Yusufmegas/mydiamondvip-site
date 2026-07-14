// Teklif hazırlama demo sistemi — paylaşılan tipler.
// DİKKAT: Hizmet bazlı fiyat, birim fiyat, satır toplamı YOK — tek toplam fiyat.

export interface SelectedOfferService {
  id: string;
  title: string;
  description: string;
  quantity: number;
  categoryId: string;
  isCustom: boolean;
  sortOrder: number;
}

export type QuoteCurrency = 'TL' | 'USD' | 'EUR';
export type QuoteVatMode = 'KDV Hariç' | 'KDV Dahil' | 'KDV Uygulanmayacaktır';

export interface QuoteDraft {
  quoteNumber: string;
  quoteDate: string; // YYYY-MM-DD
  validUntil: string; // YYYY-MM-DD
  preparedBy: string;
  title: string;
  customer: {
    name: string;
    contactPerson: string;
    phone: string;
    email: string;
    address: string;
    taxOffice: string;
    taxNumber: string;
  };
  vehicle: {
    brand: string;
    brandCustom: string;
    model: string;
    modelCustom: string;
    year: string;
    chassis: string;
    plate: string;
    count: string;
    purpose: string;
    projectNote: string;
  };
  services: SelectedOfferService[];
  price: {
    amount: string; // normalize edilmiş sayısal metin (ör. "50000")
    currency: QuoteCurrency;
    vat: QuoteVatMode;
  };
  terms: {
    payment: string;
    delivery: string;
    warranty: string;
    validity: string;
    notes: string;
  };
}

export const DRAFT_STORAGE_KEY = 'mdv-quote-demo-draft-v1';
export const COUNTER_STORAGE_KEY = 'mdv-quote-demo-counter-v1';

export const DEFAULT_PAYMENT_TEXT =
  "Araç kabulünde toplam teklif bedelinin %50'si ön ödeme olarak alınır.\nKalan %50, araç tesliminde tahsil edilir.";
export const DEFAULT_WARRANTY_TEXT =
  'Firmamız tarafından dizayn uygulaması yapılan araç, kullanım hataları hariç garanti kapsamındadır.';
export const DEFAULT_QUOTE_TITLE = 'VIP Araç Dizaynı Fiyat Teklifi';

function toDateInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function createDefaultDraft(quoteNumber: string): QuoteDraft {
  const today = new Date();
  const valid = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000);
  return {
    quoteNumber,
    quoteDate: toDateInput(today),
    validUntil: toDateInput(valid),
    preparedBy: '',
    title: DEFAULT_QUOTE_TITLE,
    customer: {
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      taxOffice: '',
      taxNumber: '',
    },
    vehicle: {
      brand: '',
      brandCustom: '',
      model: '',
      modelCustom: '',
      year: '',
      chassis: '',
      plate: '',
      count: '1',
      purpose: '',
      projectNote: '',
    },
    services: [],
    price: { amount: '', currency: 'TL', vat: 'KDV Hariç' },
    terms: {
      payment: DEFAULT_PAYMENT_TEXT,
      delivery: '',
      warranty: DEFAULT_WARRANTY_TEXT,
      validity: '15 gün',
      notes: '',
    },
  };
}

/** Marka/model: "Diğer" seçildiyse elle yazılan gerçek değer döner. */
export function resolveDraftVehicle(v: QuoteDraft['vehicle']): { brand: string; model: string } {
  const brand = v.brand === 'Diğer' ? v.brandCustom.trim() : v.brand;
  const model = v.brand === 'Diğer' || v.model === 'Diğer' ? v.modelCustom.trim() : v.model;
  return { brand, model };
}

/** Virgül/nokta girişini normalize eder; geçersizse null. */
export function parseAmount(raw: string): number | null {
  const cleaned = raw.trim().replace(/\s/g, '');
  if (cleaned === '') return null;
  // "50.000,50" → 50000.50 | "50000.50" → 50000.50 | "50,000" → 50000
  let normalized = cleaned;
  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(cleaned)) {
    normalized = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(cleaned)) {
    normalized = cleaned.replace(/,/g, '');
  } else {
    normalized = cleaned.replace(',', '.');
  }
  const n = Number(normalized);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

/** Türkçe sayı biçimi: 50000 → "50.000" */
export function formatAmountTR(n: number): string {
  return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(n);
}

export function formatDateTR(dateInput: string): string {
  if (!dateInput) return '';
  const [y, m, d] = dateInput.split('-');
  if (!y || !m || !d) return dateInput;
  return `${d}.${m}.${y}`;
}
