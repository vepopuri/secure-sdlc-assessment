import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { NeonQueryFunction } from '@neondatabase/serverless';
import { getSql } from '../../../_lib/db';
import { requireSession, requireRole, sendError, HttpError, type EngagementRole } from '../../../_lib/authz';

const VALID_ROLES: EngagementRole[] = ['owner', 'reviewer', 'viewer'];

interface UpdateRoleBody {
  role?: EngagementRole;
}

async function countOwners(sql: NeonQueryFunction<false, false>, engagementId: string): Promise<number> {
  const rows = await sql`
    select count(*)::int as count from engagement_members where engagement_id = ${engagementId} and role = 'owner'
  `;
  return (rows[0] as { count: number }).count;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const user = await requireSession(req);
    const engagementId = req.query.id as string;
    const targetUserId = req.query.userId as string;
    const sql = getSql();

    await requireRole(engagementId, user.id, ['owner']);

    const target = (
      await sql`
        select role from engagement_members where engagement_id = ${engagementId} and user_id = ${targetUserId} limit 1
      `
    )[0] as { role: EngagementRole } | undefined;
    if (!target) throw new HttpError(404, 'This person is not a member of the engagement.');

    if (req.method === 'PATCH') {
      const body = (req.body ?? {}) as UpdateRoleBody;
      const role = body.role;
      if (!role || !VALID_ROLES.includes(role)) throw new HttpError(400, 'A valid role is required.');
      if (target.role === 'owner' && role !== 'owner' && (await countOwners(sql, engagementId)) <= 1) {
        throw new HttpError(400, 'An engagement must have at least one owner.');
      }
      const rows = await sql`
        update engagement_members set role = ${role}
        where engagement_id = ${engagementId} and user_id = ${targetUserId}
        returning user_id as "userId", role
      `;
      res.status(200).json({ member: rows[0] });
      return;
    }

    if (req.method === 'DELETE') {
      if (target.role === 'owner' && (await countOwners(sql, engagementId)) <= 1) {
        throw new HttpError(400, 'An engagement must have at least one owner.');
      }
      await sql`delete from engagement_members where engagement_id = ${engagementId} and user_id = ${targetUserId}`;
      res.status(204).end();
      return;
    }

    res.status(405).json({ error: 'Method not allowed. Use PATCH or DELETE.' });
  } catch (err) {
    sendError(res, err);
  }
}
