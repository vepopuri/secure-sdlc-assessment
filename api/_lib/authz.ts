// Shared authentication/authorization checks for every engagement-scoped
// endpoint. Handlers call these and let HttpError propagate to a single
// catch block that calls sendError — keeps each handler's own body limited
// to parsing + one or two SQL statements.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSessionUser, type SessionUser } from './auth';
import { getSql } from './db';

export type EngagementRole = 'owner' | 'reviewer' | 'viewer';

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function requireSession(req: VercelRequest): Promise<SessionUser> {
  const user = await getSessionUser(req);
  if (!user) throw new HttpError(401, 'Not authenticated.');
  return user;
}

export async function requireMember(engagementId: string, userId: string): Promise<EngagementRole> {
  const sql = getSql();
  const rows = await sql`
    select role from engagement_members where engagement_id = ${engagementId} and user_id = ${userId} limit 1
  `;
  const row = rows[0] as { role: EngagementRole } | undefined;
  if (!row) throw new HttpError(403, 'You are not a member of this engagement.');
  return row.role;
}

export async function requireRole(
  engagementId: string,
  userId: string,
  allowed: EngagementRole[],
): Promise<EngagementRole> {
  const role = await requireMember(engagementId, userId);
  if (!allowed.includes(role)) throw new HttpError(403, 'You do not have permission to perform this action.');
  return role;
}

export function sendError(res: VercelResponse, err: unknown): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
}
