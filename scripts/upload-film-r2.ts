// Scroll-film videolarını (public/codec/*.mp4) R2'ye yükler ve bucket CORS'unu ayarlar.
// mp4'ler .gitignore'da olduğu için Railway'e gitmez; production film bunlardan okunur
// (NEXT_PUBLIC_FILM_*_URL → lib/filmSources.ts).
//
// Kullanım (credentials yalnızca Railway'de durur, hiçbir dosyaya yazılmaz):
//   railway run npm run film:upload
//
// Adımlar — biri başarısız olursa script durur:
//   1) S3_PUBLIC_BASE_URL'in gerçekten S3_BUCKET'a bağlı olduğunu probe nesnesiyle doğrula
//   2) faststart kontrolü (moov, mdat'tan önce); değilse geçici kopyayı ffmpeg ile düzelt
//   3) multipart upload (aynı sha256 zaten yüklüyse atlanır)
//   4) CORS doğrulaması (Range + Origin → 206 + Access-Control-Allow-Origin)
//
// Versiyonlu yol (FILM_PREFIX): Cloudflare edge eski URL'leri immutable cache'ler.
// Video DEĞİŞİRSE prefix'i artır (film/v3/ …) ve Railway'deki NEXT_PUBLIC_FILM_*_URL
// değişkenlerini güncelleyip yeniden deploy et — aynı URL'nin üzerine yazmak
// eski kopyanın 1 yıl cache'te kalmasına yol açar.
//
// CORS bucket seviyesinde ve S3 token'ının (Object R/W) yetkisi dışında; wrangler ile
// bir kez ayarlandı:
//   npx wrangler r2 bucket cors set mydiamondvip-media --file cors.json
//   (format: { "rules": [{ "allowed": { "origins", "methods", "headers" },
//              "exposeHeaders", "maxAgeSeconds" }] })
import { createHash, randomBytes } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createReadStream, openSync, readSync, fstatSync, closeSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

const FILM_PREFIX = 'film/v2';
const FILES = [
  { local: 'public/codec/film-720.mp4', key: `${FILM_PREFIX}/film-720.mp4` },
  { local: 'public/codec/film-1080.mp4', key: `${FILM_PREFIX}/film-1080.mp4` },
];
const SITE_ORIGIN = 'https://mydiamondvip.com';
const CACHE_CONTROL = 'public, max-age=31536000, immutable';

function env(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`HATA: ${name} tanımlı değil. "railway run npm run film:upload" ile çalıştırın.`);
    process.exit(1);
  }
  return v;
}

const bucket = env('S3_BUCKET');
const publicBase = env('S3_PUBLIC_BASE_URL').replace(/\/+$/, '');
const s3 = new S3Client({
  endpoint: env('S3_ENDPOINT'),
  region: process.env.S3_REGION || 'auto',
  credentials: {
    accessKeyId: env('S3_ACCESS_KEY_ID'),
    secretAccessKey: env('S3_SECRET_ACCESS_KEY'),
  },
  forcePathStyle: true,
});

async function verifyBucketMapping() {
  const key = `film/.probe-${randomBytes(8).toString('hex')}.txt`;
  const body = randomBytes(16).toString('hex');
  await s3.send(new PutObjectCommand({
    Bucket: bucket, Key: key, Body: body, ContentType: 'text/plain', CacheControl: 'no-store',
  }));
  try {
    const r = await fetch(`${publicBase}/${key}`, { cache: 'no-store' });
    const text = r.ok ? await r.text() : '';
    if (text !== body) {
      throw new Error(`${publicBase} → ${bucket} eşleşmedi (HTTP ${r.status}). Durduruldu.`);
    }
    console.log(`✓ ${publicBase} → bucket "${bucket}" doğrulandı`);
  } finally {
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  }
}

/** Üst seviye MP4 atomlarını okur; moov mdat'tan önceyse faststart'tır. */
function isFaststart(file: string): boolean {
  const fd = openSync(file, 'r');
  try {
    const size = fstatSync(fd).size;
    const b = Buffer.alloc(16);
    let p = 0;
    while (p < size) {
      readSync(fd, b, 0, 16, p);
      let n = b.readUInt32BE(0);
      const type = b.toString('latin1', 4, 8);
      if (type === 'moov') return true;
      if (type === 'mdat') return false;
      if (n === 1) n = Number(b.readBigUInt64BE(8));
      if (n === 0) break;
      p += n;
    }
    return false;
  } finally {
    closeSync(fd);
  }
}

/** Orijinale dokunmadan faststart'lı kopyayı döndürür. */
function ensureFaststart(file: string): string {
  if (isFaststart(file)) {
    console.log(`✓ faststart: ${file}`);
    return file;
  }
  const out = path.join(tmpdir(), `faststart-${randomBytes(4).toString('hex')}-${path.basename(file)}`);
  console.log(`! faststart değil: ${file} → ffmpeg ile düzeltiliyor (${out})`);
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', file, '-c', 'copy', '-movflags', '+faststart', out], {
    stdio: 'inherit',
  });
  if (!isFaststart(out)) throw new Error(`ffmpeg sonrası hâlâ faststart değil: ${out}`);
  return out;
}

async function sha256(file: string): Promise<string> {
  const h = createHash('sha256');
  for await (const chunk of createReadStream(file)) h.update(chunk);
  return h.digest('hex');
}

async function remoteSha(key: string): Promise<string | undefined> {
  try {
    const head = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return head.Metadata?.sha256;
  } catch {
    return undefined;
  }
}

async function upload(file: string, key: string) {
  const hash = await sha256(file);
  if ((await remoteSha(key)) === hash) {
    console.log(`= zaten güncel, atlandı: ${key}`);
    return;
  }
  const size = fstatSync(openSync(file, 'r')).size;
  const up = new Upload({
    client: s3,
    params: {
      Bucket: bucket,
      Key: key,
      Body: createReadStream(file),
      ContentType: 'video/mp4',
      CacheControl: CACHE_CONTROL,
      Metadata: { sha256: hash },
    },
    partSize: 16 * 1024 * 1024,
    queueSize: 4,
  });
  let lastPct = -10;
  up.on('httpUploadProgress', (p) => {
    const pct = Math.floor(((p.loaded ?? 0) / size) * 100);
    if (pct >= lastPct + 10) {
      lastPct = pct;
      console.log(`  ${key}: %${pct}`);
    }
  });
  await up.done();
  console.log(`✓ yüklendi: ${key} (${(size / 1048576).toFixed(1)} MB)`);
}

async function verifyCors(key: string) {
  const r = await fetch(`${publicBase}/${key}`, {
    headers: { Range: 'bytes=0-1023', Origin: SITE_ORIGIN },
  });
  await r.arrayBuffer();
  const acao = r.headers.get('access-control-allow-origin');
  const expose = r.headers.get('access-control-expose-headers') ?? '';
  if (r.status !== 206 || acao !== SITE_ORIGIN || !/content-range/i.test(expose)) {
    throw new Error(
      `${key}: CORS/Range eksik (HTTP ${r.status}, ACAO=${acao ?? '-'}, expose=${expose || '-'}). ` +
        'Bucket CORS kuralını wrangler ile kontrol edin (dosya başındaki not).',
    );
  }
  console.log(`✓ 206 + CORS: ${key}`);
}

async function main() {
  console.log('1) bucket doğrulama');
  await verifyBucketMapping();

  console.log('2) faststart kontrolü');
  const prepared = FILES.map((f) => ({ ...f, path: ensureFaststart(f.local) }));

  console.log('3) yükleme');
  for (const f of prepared) await upload(f.path, f.key);

  console.log('4) CORS doğrulaması');
  for (const f of FILES) await verifyCors(f.key);

  console.log('\nURL\'ler:');
  for (const f of FILES) console.log(`  ${publicBase}/${f.key}`);
}

main().catch((err) => {
  console.error('HATA:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
