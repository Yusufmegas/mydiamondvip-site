export function StatusBadge({ status }: { status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' }) {
  const map = {
    PUBLISHED: { cls: 'adm-badge-published', label: 'Yayında' },
    DRAFT: { cls: 'adm-badge-draft', label: 'Taslak' },
    ARCHIVED: { cls: 'adm-badge-archived', label: 'Arşiv' },
  }[status];
  return <span className={`adm-badge ${map.cls}`}>{map.label}</span>;
}
