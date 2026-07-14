'use server';

// Admin server action'ları — HER action requireAdmin + Zod doğrulamasından geçer.
// IDOR koruması: tüm kayıt erişimleri id üzerinden DB'de yeniden doğrulanır;
// mutation'larda transaction; unique ihlalleri kullanıcı dostu mesaja çevrilir.

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/guard';
import { writeAudit } from '@/lib/audit';
import {
  projectFormSchema,
  mediaMetaSchema,
  reorderSchema,
  statusActionSchema,
  idSchema,
  uploadMetaSchema,
  ALLOWED_UPLOAD_MIME,
  MAX_UPLOAD_BYTES,
} from '@/lib/validation/project';
import { normalizeMatterportUrl } from '@/lib/projects/matterport';
import { validateAndProcessImage, orientationFromDims, MediaValidationError } from '@/lib/media/process';
import {
  uploadObject,
  deleteObject,
  buildPublicUrl,
  isStorageConfigured,
  StorageConfigurationError,
} from '@/lib/storage';

const STORAGE_MISSING_MSG = 'Görsel depolama yapılandırılmamış. S3/R2 bağlantısını tamamlayın.';

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

function friendlyDbError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('Unique constraint')) {
    if (msg.includes('slug')) return 'Bu slug zaten başka bir projede kullanılıyor.';
    if (msg.toLowerCase().includes('matterport')) return 'Bu Matterport modeli zaten başka bir projede kullanılıyor.';
    return 'Bu değer zaten kullanımda (benzersiz olmalı).';
  }
  return 'İşlem tamamlanamadı: ' + msg;
}

/** Yayın sonrası public yolların tazelenmesi — Railway redeploy GEREKMEZ. */
function revalidatePublic(slugs: string[]) {
  revalidatePath('/');
  revalidatePath('/projeler');
  for (const s of new Set(slugs)) revalidatePath(`/projeler/${s}`);
  revalidatePath('/sitemap.xml');
}

interface MatterportResolved {
  matterportTitle: string | null;
  matterportUrl: string | null;
  matterportModelId: string | null;
}

function resolveMatterport(input: {
  matterportEnabled: boolean;
  matterportTitle?: string;
  matterportInput?: string;
}): MatterportResolved | { error: string } {
  if (!input.matterportEnabled) {
    return { matterportTitle: null, matterportUrl: null, matterportModelId: null };
  }
  const normalized = normalizeMatterportUrl(input.matterportInput ?? '');
  if ('error' in normalized) return { error: normalized.error };
  return {
    matterportTitle: input.matterportTitle?.trim() || null,
    matterportUrl: normalized.embedUrl,
    matterportModelId: normalized.modelId,
  };
}

// ---------------- Proje oluşturma / güncelleme ----------------

export async function createProject(raw: unknown): Promise<ActionResult<{ id: string }>> {
  const admin = await requireAdmin();
  const parsed = projectFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: 'Form doğrulanamadı.', fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const mp = resolveMatterport(parsed.data);
  if ('error' in mp) return { ok: false, error: mp.error };

  try {
    const db = getDb();
    const created = await db.project.create({
      data: {
        slug: parsed.data.slug,
        title: parsed.data.title,
        vehicle: parsed.data.vehicle,
        categories: parsed.data.categories,
        operations: parsed.data.operations,
        materials: parsed.data.materials,
        keywords: parsed.data.keywords,
        summary: parsed.data.summary,
        description: parsed.data.description,
        featured: parsed.data.featured,
        sortOrder: parsed.data.sortOrder,
        seoTitle: parsed.data.seoTitle || null,
        seoDescription: parsed.data.seoDescription || null,
        robotsIndex: parsed.data.robotsIndex,
        status: 'DRAFT',
        ...mp,
      },
    });
    await writeAudit(admin.userId, 'PROJECT_CREATE', 'project', created.id, { slug: created.slug });
    return { ok: true, data: { id: created.id } };
  } catch (err) {
    return { ok: false, error: friendlyDbError(err) };
  }
}

export async function updateProject(projectId: unknown, raw: unknown): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = idSchema.safeParse(projectId);
  if (!id.success) return { ok: false, error: 'Geçersiz proje.' };
  const parsed = projectFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: 'Form doğrulanamadı.', fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const mp = resolveMatterport(parsed.data);
  if ('error' in mp) return { ok: false, error: mp.error };

  try {
    const db = getDb();
    const existing = await db.project.findUnique({ where: { id: id.data } });
    if (!existing) return { ok: false, error: 'Proje bulunamadı.' };

    const slugChanged = existing.slug !== parsed.data.slug;
    const matterportChanged = existing.matterportUrl !== mp.matterportUrl;

    await db.$transaction(async (tx) => {
      await tx.project.update({
        where: { id: existing.id },
        data: {
          slug: parsed.data.slug,
          title: parsed.data.title,
          vehicle: parsed.data.vehicle,
          categories: parsed.data.categories,
          operations: parsed.data.operations,
          materials: parsed.data.materials,
          keywords: parsed.data.keywords,
          summary: parsed.data.summary,
          description: parsed.data.description,
          featured: parsed.data.featured,
          sortOrder: parsed.data.sortOrder,
          seoTitle: parsed.data.seoTitle || null,
          seoDescription: parsed.data.seoDescription || null,
          robotsIndex: parsed.data.robotsIndex,
          ...mp,
        },
      });

      // Yayınlanmış slug değişti → kalıcı redirect kaydı (eski URL kırılmaz)
      if (slugChanged && existing.status === 'PUBLISHED') {
        await tx.slugRedirect.upsert({
          where: { oldSlug: existing.slug },
          create: { oldSlug: existing.slug, newSlug: parsed.data.slug, projectId: existing.id },
          update: { newSlug: parsed.data.slug, projectId: existing.id },
        });
        // Yeni slug'a işaret eden eski ters kayıt varsa döngüyü kır
        await tx.slugRedirect.deleteMany({ where: { oldSlug: parsed.data.slug } });
      }
    });

    if (slugChanged) {
      await writeAudit(admin.userId, 'SLUG_CHANGE', 'project', existing.id, {
        from: existing.slug,
        to: parsed.data.slug,
      });
    }
    if (matterportChanged) {
      await writeAudit(admin.userId, 'MATTERPORT_CHANGE', 'project', existing.id, {
        modelId: mp.matterportModelId,
      });
    }
    await writeAudit(admin.userId, 'PROJECT_UPDATE', 'project', existing.id, { slug: parsed.data.slug });

    if (existing.status === 'PUBLISHED') {
      revalidatePublic([existing.slug, parsed.data.slug]);
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: friendlyDbError(err) };
  }
}

// ---------------- Durum işlemleri ----------------

export async function setProjectStatus(raw: unknown): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = statusActionSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: 'Geçersiz istek.' };

  try {
    const db = getDb();
    const project = await db.project.findUnique({ where: { id: parsed.data.projectId }, include: { media: true } });
    if (!project) return { ok: false, error: 'Proje bulunamadı.' };

    const map = {
      PUBLISH: { status: 'PUBLISHED' as const, audit: 'PROJECT_PUBLISH' as const },
      UNPUBLISH: { status: 'DRAFT' as const, audit: 'PROJECT_UNPUBLISH' as const },
      ARCHIVE: { status: 'ARCHIVED' as const, audit: 'PROJECT_ARCHIVE' as const },
      UNARCHIVE: { status: 'DRAFT' as const, audit: 'PROJECT_UNARCHIVE' as const },
    }[parsed.data.action];

    if (parsed.data.action === 'PUBLISH') {
      const hasCover = project.media.some((m) => m.role === 'COVER');
      if (!hasCover) return { ok: false, error: 'Yayınlamadan önce kapak görseli yükleyin.' };
      if (project.matterportUrl && !project.media.some((m) => m.role === 'MATTERPORT_POSTER')) {
        return { ok: false, error: 'Matterport turu için poster görseli zorunludur.' };
      }
    }

    await db.project.update({
      where: { id: project.id },
      data: {
        status: map.status,
        publishedAt: parsed.data.action === 'PUBLISH' ? (project.publishedAt ?? new Date()) : project.publishedAt,
      },
    });

    await writeAudit(admin.userId, map.audit, 'project', project.id, { slug: project.slug });
    revalidatePublic([project.slug]);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: friendlyDbError(err) };
  }
}

export async function duplicateProject(projectId: unknown): Promise<ActionResult<{ id: string }>> {
  const admin = await requireAdmin();
  const id = idSchema.safeParse(projectId);
  if (!id.success) return { ok: false, error: 'Geçersiz proje.' };

  try {
    const db = getDb();
    const src = await db.project.findUnique({ where: { id: id.data }, include: { media: true } });
    if (!src) return { ok: false, error: 'Proje bulunamadı.' };

    let slug = `${src.slug}-kopya`;
    let n = 2;
    while (await db.project.findUnique({ where: { slug } })) {
      slug = `${src.slug}-kopya-${n++}`;
      if (n > 50) return { ok: false, error: 'Uygun kopya slug üretilemedi.' };
    }

    const created = await db.$transaction(async (tx) => {
      const proj = await tx.project.create({
        data: {
          slug,
          title: `${src.title} (Kopya)`,
          vehicle: src.vehicle,
          categories: src.categories,
          operations: src.operations,
          materials: src.materials,
          keywords: src.keywords,
          summary: src.summary,
          description: src.description,
          featured: false,
          sortOrder: src.sortOrder,
          seoTitle: src.seoTitle,
          seoDescription: src.seoDescription,
          robotsIndex: src.robotsIndex,
          status: 'DRAFT',
          // Matterport turu KOPYALANMAZ — model ID benzersizdir (bir tur = bir araç)
          matterportTitle: null,
          matterportUrl: null,
          matterportModelId: null,
        },
      });
      // Medya kayıtları aynı public dosyaya işaret eden yeni satırlar olarak kopyalanır
      for (const m of src.media) {
        await tx.projectMedia.create({
          data: {
            projectId: proj.id,
            role: m.role,
            storageKey: null, // dosyanın sahibi orijinal kayıt — kopya silinince dosya silinmez
            publicUrl: m.publicUrl,
            thumbnailUrl: m.thumbnailUrl,
            originalFileName: m.originalFileName,
            mimeType: m.mimeType,
            width: m.width,
            height: m.height,
            fileSize: m.fileSize,
            alt: m.alt,
            caption: m.caption,
            orientation: m.orientation,
            objectPositionX: m.objectPositionX,
            objectPositionY: m.objectPositionY,
            sortOrder: m.sortOrder,
          },
        });
      }
      return proj;
    });

    await writeAudit(admin.userId, 'PROJECT_DUPLICATE', 'project', created.id, { from: src.id });
    return { ok: true, data: { id: created.id } };
  } catch (err) {
    return { ok: false, error: friendlyDbError(err) };
  }
}

// ---------------- Medya işlemleri ----------------

export async function uploadProjectMedia(formData: FormData): Promise<ActionResult<{ mediaId: string }>> {
  const admin = await requireAdmin();

  const meta = uploadMetaSchema.safeParse({
    projectId: formData.get('projectId'),
    role: formData.get('role'),
  });
  if (!meta.success) return { ok: false, error: 'Geçersiz yükleme isteği.' };

  const file = formData.get('file');
  if (!(file instanceof File)) return { ok: false, error: 'Dosya bulunamadı.' };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, error: 'Dosya 20 MB sınırını aşıyor.' };
  if (!ALLOWED_UPLOAD_MIME.includes(file.type as (typeof ALLOWED_UPLOAD_MIME)[number])) {
    return { ok: false, error: 'Yalnızca JPEG, PNG ve WebP kabul edilir.' };
  }
  if (!isStorageConfigured()) {
    return { ok: false, error: STORAGE_MISSING_MSG };
  }

  try {
    const db = getDb();
    const project = await db.project.findUnique({ where: { id: meta.data.projectId }, include: { media: true } });
    if (!project) return { ok: false, error: 'Proje bulunamadı.' };

    const buffer = Buffer.from(await file.arrayBuffer());
    const processed = await validateAndProcessImage(buffer); // gerçek içerik doğrulaması (sharp)

    // Rastgele UUID tabanlı key — kullanıcı dosya adı asla key olmaz
    const baseKey = `projects/${project.id}/${randomUUID()}`;
    const mainKey = `${baseKey}.webp`;
    const thumbKey = `${baseKey}-thumb.webp`;

    // 1) storage'a yükle — başarısızsa DB kaydı oluşturulmaz
    await uploadObject(mainKey, processed.main, 'image/webp');
    await uploadObject(thumbKey, processed.thumb, 'image/webp');

    try {
      const created = await db.$transaction(async (tx) => {
        // COVER ve MATTERPORT_POSTER tekildir: yenisi eskisinin yerini alır
        if (meta.data.role !== 'GALLERY') {
          const olds = project.media.filter((m) => m.role === meta.data.role);
          for (const old of olds) {
            await tx.projectMedia.delete({ where: { id: old.id } });
            if (old.storageKey) {
              // eski dosyalar transaction sonrası temizlenir (aşağıda)
            }
          }
        }
        const nextOrder =
          meta.data.role === 'GALLERY'
            ? Math.max(0, ...project.media.filter((m) => m.role === 'GALLERY').map((m) => m.sortOrder + 1))
            : 0;
        return tx.projectMedia.create({
          data: {
            projectId: project.id,
            role: meta.data.role,
            storageKey: mainKey,
            publicUrl: buildPublicUrl(mainKey),
            thumbnailUrl: buildPublicUrl(thumbKey),
            originalFileName: file.name.slice(0, 200),
            mimeType: 'image/webp',
            width: processed.width,
            height: processed.height,
            fileSize: processed.mainSize,
            alt: '',
            orientation: orientationFromDims(processed.width, processed.height),
            sortOrder: nextOrder,
          },
        });
      });

      // Tekil rollerde eski dosyaları storage'dan temizle (best-effort)
      if (meta.data.role !== 'GALLERY') {
        for (const old of project.media.filter((m) => m.role === meta.data.role)) {
          if (old.storageKey) {
            await deleteObject(old.storageKey).catch(() => {});
            await deleteObject(old.storageKey.replace(/\.webp$/, '-thumb.webp')).catch(() => {});
          }
        }
      }

      await writeAudit(admin.userId, 'MEDIA_UPLOAD', 'media', created.id, {
        projectId: project.id,
        role: meta.data.role,
      });
      if (project.status === 'PUBLISHED') revalidatePublic([project.slug]);
      return { ok: true, data: { mediaId: created.id } };
    } catch (dbErr) {
      // DB başarısız → orphan object'leri temizlemeye çalış
      await deleteObject(mainKey).catch(() => {});
      await deleteObject(thumbKey).catch(() => {});
      throw dbErr;
    }
  } catch (err) {
    if (err instanceof MediaValidationError) return { ok: false, error: err.message };
    if (err instanceof StorageConfigurationError) return { ok: false, error: STORAGE_MISSING_MSG };
    // Upload yolunda ham hata mesajı (S3 SDK/endpoint detayı) kullanıcıya SIZDIRILMAZ
    console.error('[uploadProjectMedia] hata:', err);
    return { ok: false, error: 'Görsel yüklenemedi. Lütfen tekrar deneyin.' };
  }
}

export async function updateMediaMeta(raw: unknown): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = mediaMetaSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: 'Medya bilgileri doğrulanamadı.', fieldErrors: parsed.error.flatten().fieldErrors };
  }
  try {
    const db = getDb();
    const media = await db.projectMedia.findUnique({ where: { id: parsed.data.mediaId }, include: { project: true } });
    if (!media) return { ok: false, error: 'Görsel bulunamadı.' };

    await db.projectMedia.update({
      where: { id: media.id },
      data: {
        alt: parsed.data.alt,
        caption: parsed.data.caption || null,
        orientation: parsed.data.orientation,
        objectPositionX: parsed.data.objectPositionX,
        objectPositionY: parsed.data.objectPositionY,
      },
    });
    await writeAudit(admin.userId, 'MEDIA_UPDATE', 'media', media.id, { projectId: media.projectId });
    if (media.project.status === 'PUBLISHED') revalidatePublic([media.project.slug]);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: friendlyDbError(err) };
  }
}

export async function deleteProjectMedia(mediaId: unknown): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = idSchema.safeParse(mediaId);
  if (!id.success) return { ok: false, error: 'Geçersiz görsel.' };

  try {
    const db = getDb();
    const media = await db.projectMedia.findUnique({ where: { id: id.data }, include: { project: true } });
    if (!media) return { ok: false, error: 'Görsel bulunamadı.' };

    // Aynı dosyaya işaret eden başka kayıt var mı? (kopyalanmış projeler)
    const sharedCount = media.storageKey
      ? await db.projectMedia.count({ where: { publicUrl: media.publicUrl, id: { not: media.id } } })
      : 1;

    await db.$transaction(async (tx) => {
      await tx.projectMedia.delete({ where: { id: media.id } });
    });

    // Dosya yalnızca başka kayıt kullanmıyorsa ve bu kayıt sahibiyse silinir
    if (media.storageKey && sharedCount === 0) {
      try {
        await deleteObject(media.storageKey);
        await deleteObject(media.storageKey.replace(/\.webp$/, '-thumb.webp')).catch(() => {});
      } catch (storageErr) {
        return {
          ok: false,
          error:
            'Veritabanı kaydı silindi ancak storage dosyası temizlenemedi: ' +
            (storageErr instanceof Error ? storageErr.message : 'bilinmeyen hata'),
        };
      }
    }

    await writeAudit(admin.userId, 'MEDIA_DELETE', 'media', media.id, { projectId: media.projectId });
    if (media.project.status === 'PUBLISHED') revalidatePublic([media.project.slug]);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: friendlyDbError(err) };
  }
}

export async function reorderGallery(raw: unknown): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = reorderSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: 'Geçersiz sıralama isteği.' };

  try {
    const db = getDb();
    const project = await db.project.findUnique({
      where: { id: parsed.data.projectId },
      include: { media: true },
    });
    if (!project) return { ok: false, error: 'Proje bulunamadı.' };

    // IDOR koruması: yalnızca bu projeye ait GALLERY id'leri kabul edilir
    const galleryIds = new Set(project.media.filter((m) => m.role === 'GALLERY').map((m) => m.id));
    if (!parsed.data.orderedMediaIds.every((mid) => galleryIds.has(mid))) {
      return { ok: false, error: 'Sıralama listesi bu projeye ait değil.' };
    }

    await db.$transaction(
      parsed.data.orderedMediaIds.map((mid, index) =>
        db.projectMedia.update({ where: { id: mid }, data: { sortOrder: index } }),
      ),
    );

    await writeAudit(admin.userId, 'MEDIA_UPDATE', 'media', project.id, { reorder: true });
    if (project.status === 'PUBLISHED') revalidatePublic([project.slug]);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: friendlyDbError(err) };
  }
}
