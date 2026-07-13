'use client';

// Liste satırı işlemleri — durum değişimleri onaylı; çift tıklama korumalı.
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { setProjectStatus, duplicateProject } from '@/lib/projects/actions';

export function ProjectRowActions({
  projectId,
  status,
  slug,
}: {
  projectId: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  slug: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function run(action: 'PUBLISH' | 'UNPUBLISH' | 'ARCHIVE' | 'UNARCHIVE', confirmText?: string) {
    if (pending) return;
    if (confirmText && !window.confirm(confirmText)) return;
    startTransition(async () => {
      const res = await setProjectStatus({ projectId, action });
      setMsg(res.ok ? null : res.error);
      router.refresh();
    });
  }

  return (
    <div className="adm-row" style={{ flexWrap: 'nowrap' }}>
      <Link className="adm-btn adm-btn-sm" href={`/admin/projeler/${projectId}`}>Düzenle</Link>
      <Link className="adm-btn adm-btn-sm" href={`/admin/projeler/${projectId}/onizleme`} target="_blank">
        Önizle
      </Link>
      <button
        className="adm-btn adm-btn-sm"
        disabled={pending}
        onClick={() => {
          if (pending) return;
          startTransition(async () => {
            const res = await duplicateProject(projectId);
            if (res.ok && res.data) router.push(`/admin/projeler/${res.data.id}`);
            else if (!res.ok) setMsg(res.error);
          });
        }}
      >
        Kopyala
      </button>
      {status !== 'PUBLISHED' && (
        <button className="adm-btn adm-btn-sm" disabled={pending} onClick={() => run('PUBLISH')}>
          Yayınla
        </button>
      )}
      {status === 'PUBLISHED' && (
        <button
          className="adm-btn adm-btn-sm"
          disabled={pending}
          onClick={() => run('UNPUBLISH', `"${slug}" yayından kaldırılsın mı? Public sayfası 404 olur.`)}
        >
          Yayından Kaldır
        </button>
      )}
      {status !== 'ARCHIVED' ? (
        <button
          className="adm-btn adm-btn-sm adm-btn-danger"
          disabled={pending}
          onClick={() => run('ARCHIVE', `"${slug}" arşivlensin mi? Public görünürlüğü kalkar, kayıt korunur.`)}
        >
          Arşivle
        </button>
      ) : (
        <button className="adm-btn adm-btn-sm" disabled={pending} onClick={() => run('UNARCHIVE')}>
          Arşivden Çıkar
        </button>
      )}
      {msg && <span className="adm-error">{msg}</span>}
    </div>
  );
}
