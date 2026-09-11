import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';

interface LogActivityParams {
  adminId: string;
  adminUsername: string;
  action: string;
  targetType: string;
  targetPublicId?: string | null;
  targetId?: string | null;
  details?: Record<string, unknown>;
}

/** Records an admin action for the /admin/activity feed. */
export async function logActivity(params: LogActivityParams) {
  const admin = createAdminClient();
  await admin.from('activity_logs').insert({
    admin_id: params.adminId,
    admin_username: params.adminUsername,
    action: params.action,
    target_type: params.targetType,
    target_public_id: params.targetPublicId ?? null,
    target_id: params.targetId ?? null,
    details: params.details ?? null,
  });
}

interface NotifyAdminsParams {
  title: string;
  body: string;
  link?: string;
}

/** Fires a notification visible to every admin (target = 'admin'). */
export async function notifyAdmins(params: NotifyAdminsParams) {
  const admin = createAdminClient();
  await admin.from('notifications').insert({
    target: 'admin',
    recipient_id: null,
    title: params.title,
    body: params.body,
    link: params.link ?? null,
  });
}

interface NotifyUserParams {
  userId: string;
  title: string;
  body: string;
  link?: string;
}

/** Fires a notification for a specific signed-in user, if they have an account. */
export async function notifyUser(params: NotifyUserParams) {
  const admin = createAdminClient();
  await admin.from('notifications').insert({
    target: 'user',
    recipient_id: params.userId,
    title: params.title,
    body: params.body,
    link: params.link ?? null,
  });
}
