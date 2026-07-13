'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { authClient } from '@/lib/auth/client';

export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      className="adm-nav-link"
      style={{ textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', width: '100%' }}
      disabled={busy}
      onClick={async () => {
        if (busy) return;
        setBusy(true);
        await authClient.signOut();
        router.replace('/admin/giris');
        router.refresh();
      }}
    >
      {busy ? 'Çıkılıyor…' : 'Çıkış'}
    </button>
  );
}
