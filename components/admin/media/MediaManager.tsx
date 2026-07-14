'use client';

// Medya yönetimi: kapak (tek) + Matterport posteri (tek) + galeri (çoklu).
// Çoklu yükleme, sürükle-bırak dosya seçimi, dnd-kit ile galeri sıralama,
// alt/caption/orientation/focal point düzenleme, ilerleme göstergesi.
import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  uploadProjectMedia,
  deleteProjectMedia,
  updateMediaMeta,
  reorderGallery,
} from '@/lib/projects/actions';
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from '@/lib/media/constants';

const STORAGE_MISSING_MSG =
  'Görsel depolama yapılandırılmamış. Yeni görsel yüklemek için S3/R2 bağlantısını tamamlayın.';
// Transport/promise reddi: iç hata detayı kullanıcıya ASLA basılmaz.
const TRANSPORT_ERROR_MSG =
  'Yükleme tamamlanamadı. Dosya boyutunu ve internet bağlantınızı kontrol edip yeniden deneyin.';

// UI timeout — server işlemini fiziksel iptal etmez (asıl iptal R2 tarafındaki
// AbortController'da); yalnızca arayüzün sonsuza dek kilitlenmesini önler.
const CLIENT_UPLOAD_TIMEOUT_MS = 75_000;
const CLIENT_TIMEOUT_MSG =
  'Yükleme 75 saniye içinde tamamlanamadı. İşlem durduruldu; sayfayı yenileyip tekrar deneyin.';

class UploadTimeoutError extends Error {
  constructor() {
    super('client upload timeout');
    this.name = 'UploadTimeoutError';
  }
}

async function uploadWithUiTimeout(
  fd: FormData,
): Promise<Awaited<ReturnType<typeof uploadProjectMedia>>> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      uploadProjectMedia(fd),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new UploadTimeoutError()), CLIENT_UPLOAD_TIMEOUT_MS);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

function uploadErrorMessage(err: unknown): string {
  return err instanceof UploadTimeoutError ? CLIENT_TIMEOUT_MSG : TRANSPORT_ERROR_MSG;
}

export interface MediaItem {
  id: string;
  role: 'COVER' | 'MATTERPORT_POSTER' | 'GALLERY';
  publicUrl: string;
  thumbnailUrl: string | null;
  alt: string;
  caption: string | null;
  orientation: 'LANDSCAPE' | 'PORTRAIT' | 'SQUARE' | 'WIDE';
  objectPositionX: number;
  objectPositionY: number;
  sortOrder: number;
}

function UploadZone({
  label,
  multiple,
  busy,
  disabled,
  onFiles,
}: {
  label: string;
  multiple?: boolean;
  busy: boolean;
  disabled?: boolean;
  onFiles: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const inactive = disabled || busy;
  return (
    <div
      className={`adm-drop${over ? ' dragover' : ''}`}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={label}
      aria-disabled={disabled || undefined}
      style={disabled ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
      onClick={() => {
        if (!inactive) inputRef.current?.click();
      }}
      onKeyDown={(e) => {
        if (!inactive && (e.key === 'Enter' || e.key === ' ')) inputRef.current?.click();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!inactive) setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (!inactive) onFiles(Array.from(e.dataTransfer.files));
      }}
    >
      {busy ? 'Yükleniyor…' : disabled ? STORAGE_MISSING_MSG : label}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={multiple}
        disabled={disabled}
        hidden
        onChange={(e) => {
          onFiles(Array.from(e.target.files ?? []));
          // Aynı dosya yeniden seçilebilsin (başarı VEYA hata sonrası)
          e.target.value = '';
        }}
      />
    </div>
  );
}

function MediaMetaEditor({ item, onDone }: { item: MediaItem; onDone: (msg?: string) => void }) {
  const [alt, setAlt] = useState(item.alt);
  const [caption, setCaption] = useState(item.caption ?? '');
  const [orientation, setOrientation] = useState(item.orientation);
  const [px, setPx] = useState(item.objectPositionX);
  const [py, setPy] = useState(item.objectPositionY);
  const [pending, start] = useTransition();

  return (
    <div className="adm-media-meta">
      <input
        className="adm-input"
        value={alt}
        placeholder="Alt metin"
        aria-label="Alt metin"
        onChange={(e) => setAlt(e.target.value)}
      />
      <input
        className="adm-input"
        value={caption}
        placeholder="Caption (opsiyonel)"
        aria-label="Caption"
        onChange={(e) => setCaption(e.target.value)}
      />
      <div className="adm-row">
        <select
          className="adm-select"
          style={{ flex: 1 }}
          value={orientation}
          aria-label="Oryantasyon"
          onChange={(e) => setOrientation(e.target.value as MediaItem['orientation'])}
        >
          <option value="LANDSCAPE">Yatay</option>
          <option value="PORTRAIT">Dikey</option>
          <option value="SQUARE">Kare</option>
          <option value="WIDE">Geniş</option>
        </select>
      </div>
      <label className="adm-hint">
        Odak X: {px}%
        <input type="range" min={0} max={100} value={px} onChange={(e) => setPx(Number(e.target.value))} style={{ width: '100%' }} />
      </label>
      <label className="adm-hint">
        Odak Y: {py}%
        <input type="range" min={0} max={100} value={py} onChange={(e) => setPy(Number(e.target.value))} style={{ width: '100%' }} />
      </label>
      <button
        type="button"
        className="adm-btn adm-btn-sm"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await updateMediaMeta({
              mediaId: item.id,
              alt,
              caption,
              orientation,
              objectPositionX: px,
              objectPositionY: py,
            });
            onDone(res.ok ? undefined : res.error);
          })
        }
      >
        {pending ? 'Kaydediliyor…' : 'Bilgileri Kaydet'}
      </button>
    </div>
  );
}

function SortableGalleryCard({
  item,
  onDelete,
  onMetaDone,
}: {
  item: MediaItem;
  onDelete: () => void;
  onMetaDone: (msg?: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  return (
    <div ref={setNodeRef} className="adm-media-item" style={{ transform: CSS.Transform.toString(transform), transition }}>
      <div style={{ position: 'relative' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.thumbnailUrl ?? item.publicUrl} alt={item.alt || 'Galeri görseli'} />
        <span
          className="adm-drag"
          style={{ position: 'absolute', top: 6, left: 6, background: 'rgba(10,10,11,.7)', borderRadius: 3, padding: '2px 6px' }}
          {...attributes}
          {...listeners}
          aria-label="Görseli sırala"
        >
          ⠿
        </span>
        <button
          type="button"
          className="adm-btn adm-btn-sm adm-btn-danger"
          style={{ position: 'absolute', top: 6, right: 6 }}
          onClick={onDelete}
        >
          Sil
        </button>
      </div>
      <MediaMetaEditor item={item} onDone={onMetaDone} />
    </div>
  );
}

function SingleSlot({
  title,
  role,
  item,
  projectId,
  storageConfigured,
  onChanged,
}: {
  title: string;
  role: 'COVER' | 'MATTERPORT_POSTER';
  item: MediaItem | undefined;
  projectId: string;
  storageConfigured: boolean;
  onChanged: (msg?: string) => void;
}) {
  const [busy, setBusy] = useState(false);

  async function upload(files: File[]) {
    if (!files[0] || busy) return;
    // İstek gönderilmeden önce erken kontroller
    if (!storageConfigured) {
      onChanged(STORAGE_MISSING_MSG);
      return;
    }
    if (files[0].size > MAX_UPLOAD_BYTES) {
      onChanged(`Dosya en fazla ${MAX_UPLOAD_LABEL} olabilir.`);
      return;
    }
    setBusy(true);
    onChanged(undefined); // önceki hatayı temizle
    try {
      const fd = new FormData();
      fd.set('projectId', projectId);
      fd.set('role', role);
      fd.set('file', files[0]);
      const res = await uploadWithUiTimeout(fd);
      onChanged(res.ok ? undefined : res.error);
    } catch (err) {
      onChanged(uploadErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="adm-field">
      <span className="adm-label">{title}</span>
      {item ? (
        <div className="adm-media-item" style={{ maxWidth: 320 }}>
          <div style={{ position: 'relative' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.thumbnailUrl ?? item.publicUrl}
              alt={item.alt || title}
              style={{ objectPosition: `${item.objectPositionX}% ${item.objectPositionY}%` }}
            />
            <button
              type="button"
              className="adm-btn adm-btn-sm adm-btn-danger"
              style={{ position: 'absolute', top: 6, right: 6 }}
              onClick={async () => {
                if (!window.confirm(`${title} kaldırılsın mı?`)) return;
                const res = await deleteProjectMedia(item.id);
                onChanged(res.ok ? undefined : res.error);
              }}
            >
              Kaldır
            </button>
          </div>
          <MediaMetaEditor item={item} onDone={onChanged} />
          <div style={{ padding: '0 8px 8px' }}>
            <UploadZone label="Değiştir (yeni dosya seç)" busy={busy} disabled={!storageConfigured} onFiles={upload} />
          </div>
        </div>
      ) : (
        <UploadZone
          label={`${title} yükle (JPEG/PNG/WebP, maks ${MAX_UPLOAD_LABEL})`}
          busy={busy}
          disabled={!storageConfigured}
          onFiles={upload}
        />
      )}
    </div>
  );
}

export function MediaManager({
  projectId,
  media,
  storageConfigured,
}: {
  projectId: string;
  media: MediaItem[];
  storageConfigured: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [uploadCount, setUploadCount] = useState<{ done: number; total: number } | null>(null);
  const [galleryBusy, setGalleryBusy] = useState(false);

  const cover = media.find((m) => m.role === 'COVER');
  const poster = media.find((m) => m.role === 'MATTERPORT_POSTER');
  const gallery = media.filter((m) => m.role === 'GALLERY').sort((a, b) => a.sortOrder - b.sortOrder);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function refresh(msg?: string) {
    setError(msg ?? null);
    router.refresh();
  }

  async function uploadGallery(files: File[]) {
    if (galleryBusy || files.length === 0) return;
    // İstek gönderilmeden önce erken kontroller
    if (!storageConfigured) {
      setError(STORAGE_MISSING_MSG);
      return;
    }
    const oversized = files.filter((f) => f.size > MAX_UPLOAD_BYTES);
    if (oversized.length > 0) {
      setError(
        `Şu dosyalar ${MAX_UPLOAD_LABEL} sınırını aşıyor, hiçbir yükleme başlatılmadı: ` +
          oversized.map((f) => f.name.slice(0, 80)).join(', '),
      );
      return;
    }
    setGalleryBusy(true);
    setError(null);
    setUploadCount({ done: 0, total: files.length });
    try {
      for (let i = 0; i < files.length; i++) {
        const fd = new FormData();
        fd.set('projectId', projectId);
        fd.set('role', 'GALLERY');
        fd.set('file', files[i]);
        const res = await uploadWithUiTimeout(fd);
        if (!res.ok) {
          // Kalan dosyalar gönderilmez; action'ın güvenli mesajı gösterilir
          setError(`${files[i].name.slice(0, 80)}: ${res.error}`);
          break;
        }
        setUploadCount({ done: i + 1, total: files.length });
      }
    } catch (err) {
      setError(uploadErrorMessage(err));
    } finally {
      setGalleryBusy(false);
      setUploadCount(null);
      router.refresh();
    }
  }

  async function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const ids = gallery.map((g) => g.id);
    const next = arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id)));
    const res = await reorderGallery({ projectId, orderedMediaIds: next });
    refresh(res.ok ? undefined : res.error);
  }

  return (
    <div>
      {!storageConfigured && (
        <p className="adm-error" role="alert" style={{ marginBottom: 12 }}>
          {STORAGE_MISSING_MSG}
        </p>
      )}
      <div className="adm-grid-2">
        <SingleSlot
          title="Kapak Görseli"
          role="COVER"
          item={cover}
          projectId={projectId}
          storageConfigured={storageConfigured}
          onChanged={refresh}
        />
        <SingleSlot
          title="Matterport Poster Görseli"
          role="MATTERPORT_POSTER"
          item={poster}
          projectId={projectId}
          storageConfigured={storageConfigured}
          onChanged={refresh}
        />
      </div>

      <div className="adm-field" style={{ marginTop: 20 }}>
        <span className="adm-label">Galeri Görselleri ({gallery.length})</span>
        <UploadZone
          label="Galeriye görsel ekle — çoklu seçim ve sürükle-bırak desteklenir"
          multiple
          busy={galleryBusy}
          disabled={!storageConfigured}
          onFiles={uploadGallery}
        />
        {uploadCount && (
          <div style={{ marginTop: 8 }}>
            <div className="adm-progress">
              <span style={{ width: `${(uploadCount.done / uploadCount.total) * 100}%` }} />
            </div>
            <p className="adm-hint">{uploadCount.done} / {uploadCount.total} yüklendi</p>
          </div>
        )}
      </div>

      {gallery.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={gallery.map((g) => g.id)} strategy={rectSortingStrategy}>
            <div className="adm-media-grid" style={{ marginTop: 12 }}>
              {gallery.map((g) => (
                <SortableGalleryCard
                  key={g.id}
                  item={g}
                  onMetaDone={refresh}
                  onDelete={async () => {
                    if (!window.confirm('Bu galeri görseli silinsin mi? Bu işlem geri alınamaz.')) return;
                    const res = await deleteProjectMedia(g.id);
                    refresh(res.ok ? undefined : res.error);
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {error && (
        <p className="adm-error" role="alert" style={{ marginTop: 10 }}>
          {error}
        </p>
      )}
    </div>
  );
}
