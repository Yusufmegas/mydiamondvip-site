// Teklif demo — tek kodlu giriş + HMAC imzalı süreli oturum.
// QUOTE_ACCESS_CODE ve QUOTE_SESSION_SECRET yalnızca sunucuda okunur;
// kod hiçbir yerde loglanmaz, cookie içinde SAKLANMAZ.
// Better Auth admin sistemiyle bilinçli olarak AYRIDIR.
import { createHmac, createHash, timingSafeEqual } from 'node:crypto';

export const QUOTE_SESSION_COOKIE = 'mdv_quote_session';
export const QUOTE_SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 saat

export function isQuoteDemoConfigured(): boolean {
  return Boolean(process.env.QUOTE_ACCESS_CODE && process.env.QUOTE_SESSION_SECRET);
}

/** Timing-safe kod karşılaştırması — uzunluk sızıntısını önlemek için hash'ler karşılaştırılır. */
export function verifyAccessCode(input: string): boolean {
  const expected = process.env.QUOTE_ACCESS_CODE;
  if (!expected) return false;
  const a = createHash('sha256').update(input).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}

function sign(payload: string): string {
  const secret = process.env.QUOTE_SESSION_SECRET;
  if (!secret) throw new Error('QUOTE_SESSION_SECRET tanımlı değil.');
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

/** `exp.imza` biçiminde süreli token — giriş kodu token'da YER ALMAZ. */
export function createSessionToken(): string {
  const exp = String(Date.now() + QUOTE_SESSION_TTL_MS);
  return `${exp}.${sign(exp)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token || !process.env.QUOTE_SESSION_SECRET) return false;
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return false;
  const exp = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!/^\d{10,16}$/.test(exp)) return false;
  if (Number(exp) < Date.now()) return false;
  let expectedSig: string;
  try {
    expectedSig = sign(exp);
  } catch {
    return false;
  }
  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
