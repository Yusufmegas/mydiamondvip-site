'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth/client';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return; // çift tıklama koruması
    setLoading(true);
    setError(null);
    const { error: err } = await authClient.signIn.email({ email, password });
    if (err) {
      setLoading(false);
      setError(
        err.status === 429
          ? 'Çok fazla deneme yapıldı. Lütfen biraz bekleyip tekrar deneyin.'
          : 'E-posta veya şifre hatalı.',
      );
      return;
    }
    router.replace('/admin');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="adm-field">
        <label className="adm-label" htmlFor="adm-email">E-posta</label>
        <input
          id="adm-email"
          className="adm-input"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="adm-field">
        <label className="adm-label" htmlFor="adm-pass">Şifre</label>
        <input
          id="adm-pass"
          className="adm-input"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && <p className="adm-error" role="alert">{error}</p>}
      <div style={{ marginTop: 18 }}>
        <button className="adm-btn adm-btn-primary" type="submit" disabled={loading}>
          {loading ? 'Giriş yapılıyor…' : 'Giriş Yap'}
        </button>
      </div>
    </form>
  );
}
