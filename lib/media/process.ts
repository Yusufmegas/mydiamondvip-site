// Görsel doğrulama + optimizasyon (sharp).
// MIME yalnızca uzantıdan değil, sharp metadata ile GERÇEK içerikten doğrulanır.
import 'server-only';
import sharp, { type Metadata } from 'sharp';
import { MAX_INPUT_PIXELS, MAX_UPLOAD_BYTES } from '@/lib/validation/project';

const MAX_MAIN_WIDTH = 2400;
const MAIN_QUALITY = 86;
const MAX_THUMB_WIDTH = 1000;
const THUMB_QUALITY = 82;

const REAL_FORMATS = new Set(['jpeg', 'png', 'webp']);

export interface ProcessedImage {
  main: Buffer;
  thumb: Buffer;
  width: number;
  height: number;
  mainSize: number;
}

export class MediaValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MediaValidationError';
  }
}

export async function validateAndProcessImage(input: Buffer): Promise<ProcessedImage> {
  if (input.byteLength === 0) throw new MediaValidationError('Boş dosya.');
  if (input.byteLength > MAX_UPLOAD_BYTES) {
    throw new MediaValidationError('Dosya 20 MB sınırını aşıyor.');
  }

  let meta: Metadata;
  try {
    meta = await sharp(input, { limitInputPixels: MAX_INPUT_PIXELS }).metadata();
  } catch {
    throw new MediaValidationError('Dosya geçerli bir görsel değil veya bozuk.');
  }

  if (!meta.format || !REAL_FORMATS.has(meta.format)) {
    throw new MediaValidationError('Yalnızca JPEG, PNG ve WebP kabul edilir (SVG kabul edilmez).');
  }
  if (!meta.width || !meta.height) {
    throw new MediaValidationError('Görsel boyutları okunamadı.');
  }
  if (meta.width * meta.height > MAX_INPUT_PIXELS) {
    throw new MediaValidationError('Görsel piksel alanı güvenli sınırın üzerinde.');
  }

  // Oran korunur, upscale yapılmaz, EXIF kaldırılır (rotate ile yön düzeltilip metadata atılır)
  const base = sharp(input, { limitInputPixels: MAX_INPUT_PIXELS }).rotate();

  const main = await base
    .clone()
    .resize({ width: MAX_MAIN_WIDTH, withoutEnlargement: true })
    .webp({ quality: MAIN_QUALITY })
    .toBuffer({ resolveWithObject: true });

  const thumb = await base
    .clone()
    .resize({ width: MAX_THUMB_WIDTH, withoutEnlargement: true })
    .webp({ quality: THUMB_QUALITY })
    .toBuffer({ resolveWithObject: true });

  return {
    main: main.data,
    thumb: thumb.data,
    width: main.info.width,
    height: main.info.height,
    mainSize: main.info.size,
  };
}

export function orientationFromDims(width: number, height: number): 'LANDSCAPE' | 'PORTRAIT' | 'SQUARE' | 'WIDE' {
  const ratio = width / height;
  if (ratio > 1.9) return 'WIDE';
  if (ratio > 1.05) return 'LANDSCAPE';
  if (ratio < 0.95) return 'PORTRAIT';
  return 'SQUARE';
}
