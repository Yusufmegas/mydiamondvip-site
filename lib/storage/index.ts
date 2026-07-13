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
    });
  }
  return client;
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
  await getClient().send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  );
}

export async function deleteObject(key: string): Promise<void> {
  assertSafeKey(key);
  await getClient().send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }));
}

export async function objectExists(key: string): Promise<boolean> {
  assertSafeKey(key);
  try {
    await getClient().send(new HeadObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }));
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
