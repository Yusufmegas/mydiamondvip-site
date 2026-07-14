// S3 uyumlu object storage soyutlaması (Railway Object Storage / R2 / MinIO...).
// Credentials kaynak koda YAZILMAZ; yalnızca environment'tan okunur.
import 'server-only';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';

export class StorageConfigurationError extends Error {
  constructor() {
    super(
      'Object storage yapılandırılmamış. S3_ENDPOINT, S3_REGION, S3_BUCKET, ' +
        'S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY ve S3_PUBLIC_BASE_URL değişkenlerini ' +
        'tanımlayın (bkz. ADMIN_SETUP.md).',
    );
    this.name = 'StorageConfigurationError';
  }
}

export function isStorageConfigured(): boolean {
  return Boolean(
    process.env.S3_ENDPOINT &&
      process.env.S3_BUCKET &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY &&
      process.env.S3_PUBLIC_BASE_URL,
  );
}

let client: S3Client | null = null;

function getClient(): S3Client {
  if (!isStorageConfigured()) throw new StorageConfigurationError();
  if (!client) {
    client = new S3Client({
      endpoint: process.env.S3_ENDPOINT,
      region: process.env.S3_REGION || 'auto',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
      forcePathStyle: true, // sağlayıcı bağımsız en uyumlu mod
      maxAttempts: 2, // takılı bağlantıda SDK'nın uzun retry zincirini kısalt
    });
  }
  return client;
}

// Hiçbir S3 işlemi sınırsız beklemez — takılı TCP bağlantısı admin panelini
// "Yükleniyor…" durumunda kilitliyordu.
const STORAGE_OPERATION_TIMEOUT_MS = 45_000;

async function sendWithTimeout<T>(
  operation: string,
  run: (abortSignal: AbortSignal) => Promise<T>,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), STORAGE_OPERATION_TIMEOUT_MS);
  try {
    return await run(controller.signal);
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(`${operation} 45 saniye içinde tamamlanamadı.`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/** Path traversal koruması: yalnızca güvenli üretilmiş key kabul edilir. */
const SAFE_KEY = /^[a-z0-9/_.-]+$/i;

function assertSafeKey(key: string) {
  if (!SAFE_KEY.test(key) || key.includes('..') || key.startsWith('/')) {
    throw new Error('Geçersiz storage key.');
  }
}

export async function uploadObject(key: string, body: Buffer, contentType: string): Promise<void> {
  assertSafeKey(key);
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  });
  await sendWithTimeout('Görsel yükleme', (abortSignal) =>
    getClient().send(command, { abortSignal }),
  );
}

export async function deleteObject(key: string): Promise<void> {
  assertSafeKey(key);
  const command = new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key });
  await sendWithTimeout('Görsel silme', (abortSignal) =>
    getClient().send(command, { abortSignal }),
  );
}

export async function objectExists(key: string): Promise<boolean> {
  assertSafeKey(key);
  try {
    const command = new HeadObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key });
    await sendWithTimeout('Görsel kontrolü', (abortSignal) =>
      getClient().send(command, { abortSignal }),
    );
    return true;
  } catch {
    return false;
  }
}

export function buildPublicUrl(key: string): string {
  assertSafeKey(key);
  const base = process.env.S3_PUBLIC_BASE_URL;
  if (!base) throw new StorageConfigurationError();
  return `${base.replace(/\/+$/, '')}/${key}`;
}
