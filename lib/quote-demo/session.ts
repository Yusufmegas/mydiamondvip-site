// Sunucu tarafı oturum kontrolü — sayfalar bu kontrolden geçmeden render edilmez.
import 'server-only';
import { cookies } from 'next/headers';
import { QUOTE_SESSION_COOKIE, verifySessionToken } from './auth';

export async function hasQuoteSession(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(QUOTE_SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}
