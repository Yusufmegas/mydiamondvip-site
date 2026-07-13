// Audit log yazıcı — metadata içinde asla şifre/token/secret saklanmaz.
import 'server-only';
import { getDb } from '@/lib/db';
import type { Prisma } from '@/lib/generated/prisma/client';

export type AuditAction =
  | 'PROJECT_CREATE'
  | 'PROJECT_UPDATE'
  | 'PROJECT_PUBLISH'
  | 'PROJECT_UNPUBLISH'
  | 'PROJECT_ARCHIVE'
  | 'PROJECT_UNARCHIVE'
  | 'PROJECT_DUPLICATE'
  | 'SLUG_CHANGE'
  | 'MATTERPORT_CHANGE'
  | 'MEDIA_UPLOAD'
  | 'MEDIA_UPDATE'
  | 'MEDIA_DELETE';

export async function writeAudit(
  adminUserId: string,
  action: AuditAction,
  entityType: 'project' | 'media',
  entityId: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  try {
    await getDb().auditLog.create({
      data: {
        adminUserId,
        action,
        entityType,
        entityId,
        metadata: metadata ? (metadata as Prisma.InputJsonValue) : undefined,
      },
    });
  } catch (err) {
    // Audit yazımı ana işlemi asla bloklamaz; ama sessizce de yutulmaz
    console.error('[audit] yazılamadı:', err);
  }
}
