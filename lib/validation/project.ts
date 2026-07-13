// Server-side Zod doğrulamaları — client validation tek katman DEĞİLDİR.
import { z } from 'zod';
import { SLUG_PATTERN } from '@/lib/projects/slug';

const trimmed = (max: number, min = 1) => z.string().trim().min(min).max(max);

/** Boş ve duplicate kayıt engelli sıralı metin listesi */
const stringList = (maxItems: number, maxLen = 120) =>
  z
    .array(z.string().trim().min(1, 'Boş kayıt eklenemez').max(maxLen))
    .max(maxItems)
    .refine((arr) => new Set(arr.map((s) => s.toLocaleLowerCase('tr'))).size === arr.length, {
      message: 'Aynı kayıt birden fazla kez eklenemez',
    });

export const projectFormSchema = z.object({
  title: trimmed(160),
  vehicle: trimmed(120),
  slug: z.string().trim().min(3).max(96).regex(SLUG_PATTERN, 'Slug yalnızca küçük harf, rakam ve tire içerebilir'),
  categories: stringList(12, 60),
  operations: stringList(30, 160),
  materials: stringList(30, 160),
  keywords: stringList(20, 80),
  summary: trimmed(400),
  description: trimmed(4000),
  featured: z.boolean(),
  sortOrder: z.number().int().min(-1000).max(1000),
  matterportEnabled: z.boolean(),
  matterportTitle: z.string().trim().max(160).optional().or(z.literal('')),
  matterportInput: z.string().trim().max(4000).optional().or(z.literal('')),
  seoTitle: z.string().trim().max(180).optional().or(z.literal('')),
  seoDescription: z.string().trim().max(320).optional().or(z.literal('')),
  robotsIndex: z.boolean(),
});

export type ProjectFormInput = z.infer<typeof projectFormSchema>;

export const mediaRoleSchema = z.enum(['COVER', 'MATTERPORT_POSTER', 'GALLERY']);

export const mediaMetaSchema = z.object({
  mediaId: z.string().min(1).max(64),
  alt: z.string().trim().max(300),
  caption: z.string().trim().max(300).optional().or(z.literal('')),
  orientation: z.enum(['LANDSCAPE', 'PORTRAIT', 'SQUARE', 'WIDE']),
  objectPositionX: z.number().int().min(0).max(100),
  objectPositionY: z.number().int().min(0).max(100),
});

export const reorderSchema = z.object({
  projectId: z.string().min(1).max(64),
  orderedMediaIds: z.array(z.string().min(1).max(64)).min(1).max(100),
});

export const statusActionSchema = z.object({
  projectId: z.string().min(1).max(64),
  action: z.enum(['PUBLISH', 'UNPUBLISH', 'ARCHIVE', 'UNARCHIVE']),
});

export const idSchema = z.string().min(1).max(64);

export const uploadMetaSchema = z.object({
  projectId: z.string().min(1).max(64),
  role: mediaRoleSchema,
});

export const ALLOWED_UPLOAD_MIME = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024; // 20 MB
export const MAX_INPUT_PIXELS = 64_000_000; // ~64 MP güvenli sınır
