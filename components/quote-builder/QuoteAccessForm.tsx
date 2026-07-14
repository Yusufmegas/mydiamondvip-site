'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export function QuoteAccessForm() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy || !code) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/quote-demo/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        router.replace('/teklif-demo');
        router.refresh();
        return;
      }
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? 'Giriş kodu hatalı.');
    } catch {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="form" onSubmit={submit}>
      <label className="form-field">
        <span>Yetkili Giriş Kodu</span>
        <input
          type="password"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoComplete="off"
          required
          autoFocus
        />
      </label>
      {error && (
        <p className="form-error" role="alert">{error}</p>
      )}
      <button className="cta cta-primary" type="submit" disabled={busy} style={{ width: '100%' }}>
        {busy ? 'Kontrol ediliyor…' : 'Giriş Yap'}
      </button>
    </form>
  );
}
