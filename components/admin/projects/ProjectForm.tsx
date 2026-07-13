'use client';

// Yeni proje + düzenleme ortak formu — react-hook-form + server action.
// Sekmeler: Genel / Uygulamalar & Malzemeler / Matterport / Görseller / SEO & Yayın.
// Metin alanları düz metindir (HTML/rich text yok — XSS yüzeyi kapalı).
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { createProject, updateProject } from '@/lib/projects/actions';
import { slugify } from '@/lib/projects/slug';
import type { ProjectFormInput } from '@/lib/validation/project';
import { ListEditor } from './ListEditor';
import { MatterportPreview } from './MatterportPreview';
import { MediaManager, type MediaItem } from '../media/MediaManager';

const TABS = ['Genel Bilgiler', 'Uygulamalar & Malzemeler', 'Matterport', 'Görseller', 'SEO & Yayın'] as const;

export interface ProjectFormValues extends ProjectFormInput {}

export function ProjectForm({
  projectId,
  initial,
  media,
  statusLabel,
}: {
  projectId?: string;
  initial: ProjectFormValues;
  media: MediaItem[];
  statusLabel?: string;
}) {
  const router = useRouter();
  const [tab, setTab] = useState(0);
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProjectFormValues>({ defaultValues: initial });

  const matterportEnabled = watch('matterportEnabled');
  const slugValue = watch('slug');

  async function onSubmit(values: ProjectFormValues) {
    if (saving) return; // çift tıklama → duplicate mutation koruması
    setSaving(true);
    setToast(null);
    const res = projectId ? await updateProject(projectId, values) : await createProject(values);
    setSaving(false);
    if (!res.ok) {
      const fieldMsg = res.fieldErrors
        ? Object.entries(res.fieldErrors)
            .map(([k, v]) => `${k}: ${v.join(', ')}`)
            .join(' · ')
        : '';
      setToast({ ok: false, text: [res.error, fieldMsg].filter(Boolean).join(' — ') });
      return;
    }
    setToast({ ok: true, text: projectId ? 'Proje kaydedildi.' : 'Taslak oluşturuldu.' });
    if (!projectId && res.data && 'id' in res.data) {
      router.push(`/admin/projeler/${res.data.id}`);
    } else {
      router.refresh();
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      onKeyDown={(e) => {
        // Liste editörleri kendi Enter'ını yönetir; formun yanlışlıkla submit olmasını önle
        if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') e.preventDefault();
      }}
    >
      {isDirty && (
        <p className="adm-hint" style={{ marginBottom: 10 }} role="status">
          Kaydedilmemiş değişiklikler var.
        </p>
      )}

      <div className="adm-tabs" role="tablist">
        {TABS.map((t, i) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === i}
            className={`adm-tab${tab === i ? ' active' : ''}`}
            onClick={() => setTab(i)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* --- 1. Genel Bilgiler --- */}
      <div className="adm-card" style={{ marginTop: 14, display: tab === 0 ? 'block' : 'none' }}>
        <div className="adm-grid-2">
          <div className="adm-field">
            <label className="adm-label" htmlFor="f-title">Proje Başlığı</label>
            <input id="f-title" className="adm-input" {...register('title', { required: true })} />
            {errors.title && <p className="adm-error">Başlık zorunludur.</p>}
          </div>
          <div className="adm-field">
            <label className="adm-label" htmlFor="f-vehicle">Araç Modeli</label>
            <input id="f-vehicle" className="adm-input" {...register('vehicle', { required: true })} />
            {errors.vehicle && <p className="adm-error">Araç modeli zorunludur.</p>}
          </div>
        </div>
        <div className="adm-field" style={{ marginTop: 14 }}>
          <label className="adm-label" htmlFor="f-slug">Slug</label>
          <div className="adm-row">
            <input id="f-slug" className="adm-input" style={{ flex: 1 }} {...register('slug', { required: true })} />
            <button
              type="button"
              className="adm-btn adm-btn-sm"
              onClick={() => setValue('slug', slugify(getValues('title')), { shouldDirty: true })}
            >
              Başlıktan Üret
            </button>
          </div>
          <p className="adm-hint">
            Örn: mercedes-vito-vip-dizayn-03 — yayınlanmış slug değişirse eski URL otomatik yönlendirilir.
          </p>
          {slugValue && slugValue !== slugify(slugValue) && (
            <p className="adm-error">Slug geçersiz karakter içeriyor (küçük harf, rakam, tire kullanın).</p>
          )}
        </div>
        <div className="adm-field" style={{ marginTop: 14 }}>
          <Controller
            control={control}
            name="categories"
            render={({ field }) => (
              <ListEditor label="Kategoriler" values={field.value} onChange={field.onChange} placeholder="Örn: Mercedes" />
            )}
          />
        </div>
        <div className="adm-field" style={{ marginTop: 14 }}>
          <label className="adm-label" htmlFor="f-summary">Kısa Açıklama (kartlarda görünür)</label>
          <textarea id="f-summary" className="adm-textarea" rows={2} {...register('summary', { required: true })} />
        </div>
        <div className="adm-field" style={{ marginTop: 14 }}>
          <label className="adm-label" htmlFor="f-desc">Detaylı Açıklama</label>
          <textarea id="f-desc" className="adm-textarea" rows={6} {...register('description', { required: true })} />
        </div>
        <div className="adm-row" style={{ marginTop: 14 }}>
          <label className="adm-checkbox">
            <input type="checkbox" {...register('featured')} />
            Ana sayfa vitrininde göster (featured)
          </label>
          <div className="adm-field" style={{ width: 140 }}>
            <label className="adm-label" htmlFor="f-order">Sıralama</label>
            <input
              id="f-order"
              className="adm-input"
              type="number"
              {...register('sortOrder', { valueAsNumber: true })}
            />
          </div>
        </div>
      </div>

      {/* --- 2. Uygulamalar & Malzemeler --- */}
      <div className="adm-card" style={{ marginTop: 14, display: tab === 1 ? 'block' : 'none' }}>
        <Controller
          control={control}
          name="operations"
          render={({ field }) => (
            <ListEditor label="Uygulanan İşlemler" values={field.value} onChange={field.onChange} />
          )}
        />
        <div style={{ marginTop: 16 }}>
          <Controller
            control={control}
            name="materials"
            render={({ field }) => (
              <ListEditor label="Kullanılan Malzemeler" values={field.value} onChange={field.onChange} />
            )}
          />
        </div>
      </div>

      {/* --- 3. Matterport --- */}
      <div className="adm-card" style={{ marginTop: 14, display: tab === 2 ? 'block' : 'none' }}>
        <label className="adm-checkbox">
          <input type="checkbox" {...register('matterportEnabled')} />
          Bu projede Matterport 360° turu var
        </label>
        {matterportEnabled && (
          <>
            <div className="adm-field" style={{ marginTop: 14 }}>
              <label className="adm-label" htmlFor="f-mp-title">Tur Başlığı</label>
              <input id="f-mp-title" className="adm-input" {...register('matterportTitle')} />
            </div>
            <div className="adm-field" style={{ marginTop: 14 }}>
              <label className="adm-label" htmlFor="f-mp-url">Matterport URL veya iframe kodu</label>
              <textarea
                id="f-mp-url"
                className="adm-textarea"
                rows={3}
                placeholder="https://my.matterport.com/show/?m=XXXXXXXXX veya tam iframe kodu"
                {...register('matterportInput')}
              />
              <p className="adm-hint">
                Yalnızca my.matterport.com bağlantıları kabul edilir; iframe yapıştırırsanız yalnızca temiz URL saklanır.
                Bir model ID yalnızca tek projede kullanılabilir (bir tur = bir araç).
              </p>
            </div>
            <MatterportPreview input={watch('matterportInput') ?? ''} />
            <p className="adm-hint" style={{ marginTop: 10 }}>
              Poster görseli “Görseller” sekmesinden yüklenir; yayınlamadan önce zorunludur.
            </p>
          </>
        )}
      </div>

      {/* --- 4. Görseller --- */}
      <div className="adm-card" style={{ marginTop: 14, display: tab === 3 ? 'block' : 'none' }}>
        {projectId ? (
          <MediaManager projectId={projectId} media={media} />
        ) : (
          <p className="adm-hint">
            Görsel yüklemek için önce taslağı kaydedin — kayıt sonrası bu sekmeden kapak, poster ve galeri yönetilir.
          </p>
        )}
      </div>

      {/* --- 5. SEO & Yayın --- */}
      <div className="adm-card" style={{ marginTop: 14, display: tab === 4 ? 'block' : 'none' }}>
        <div className="adm-field">
          <label className="adm-label" htmlFor="f-seo-title">SEO Başlığı (boşsa proje başlığı kullanılır)</label>
          <input id="f-seo-title" className="adm-input" {...register('seoTitle')} />
        </div>
        <div className="adm-field" style={{ marginTop: 14 }}>
          <label className="adm-label" htmlFor="f-seo-desc">SEO Açıklaması (boşsa kısa açıklama kullanılır)</label>
          <textarea id="f-seo-desc" className="adm-textarea" rows={3} {...register('seoDescription')} />
        </div>
        <div style={{ marginTop: 14 }}>
          <Controller
            control={control}
            name="keywords"
            render={({ field }) => (
              <ListEditor label="Anahtar Kelimeler" values={field.value} onChange={field.onChange} />
            )}
          />
        </div>
        <label className="adm-checkbox" style={{ marginTop: 14 }}>
          <input type="checkbox" {...register('robotsIndex')} />
          Arama motorları indexleyebilir (robots index)
        </label>
        {statusLabel && (
          <p className="adm-hint" style={{ marginTop: 12 }}>
            Mevcut durum: {statusLabel}. Yayınlama/arşivleme işlemleri proje listesindeki işlemlerden yapılır.
          </p>
        )}
      </div>

      <div className="adm-row" style={{ marginTop: 16 }}>
        <button className="adm-btn adm-btn-primary" type="submit" disabled={saving}>
          {saving ? 'Kaydediliyor…' : projectId ? 'Kaydet' : 'Taslağı Kaydet'}
        </button>
        {projectId && (
          <a className="adm-btn" href={`/admin/projeler/${projectId}/onizleme`} target="_blank" rel="noreferrer">
            Önizle ↗
          </a>
        )}
      </div>

      {toast && (
        <div className={`adm-toast ${toast.ok ? 'adm-toast-ok' : 'adm-toast-err'}`} role="status">
          {toast.text}
        </div>
      )}
    </form>
  );
}
