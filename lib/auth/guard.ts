// Sunucu tarafı yetki kontrolü — HER admin server action / route handler /
// sayfa bunu kullanır. UI gizlemek güvenlik katmanı DEĞİLDİR.
import 'server-only';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuth } from './index';

export interface AdminSession {
  userId: string;
  email: string;
  name: string;
}

/** Session + OWNER rolü zorunlu. Yoksa null döner (action'lar hata üretir). */
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return null;
    const role = (session.user as { role?: string }).role;
    if (role !== 'OWNER') return null;
    return {
      userId: session.user.id,
      email: session.user.email,
      name: session.user.name,
    };
  } catch {
    return null;
  }
}

/** Sayfalar için: yetki yoksa giriş sayfasına yönlendirir. */
export async function requireAdminPage(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect('/admin/giris');
  return session;
}

/** Server action / route handler için: yetki yoksa hata fırlatır. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) throw new Error('Yetkisiz erişim.');
  return session;
}
