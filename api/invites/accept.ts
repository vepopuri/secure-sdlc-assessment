import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHash } from 'node:crypto';
import { getSql } from '../lib/db';
import { requireSession, sendError, HttpError } from '../lib/authz';

interface AcceptBody {
  token?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  try {
    const user = await requireSession(req);
    const body = (req.body ?? {}) as AcceptBody;
    const token = body.token;
    if (!token) throw new HttpError(400, 'A token is required.');
    const tokenHash = createHash('sha256').update(token).digest('hex');

    const sql = getSql();
    const invite = (
      await sql`
        select id, engagement_id as "engagementId", email, role
        from engagement_invites
        where token_hash = ${tokenHash} and accepted_at is null and expires_at > now()
        limit 1
      `
    )[0] as { id: string; engagementId: string; email: string; role: string } | undefined;
    if (!invite) throw new HttpError(410, 'This invite is invalid or has expired.');

    if (invite.email.toLowerCase() !== user.email.toLowerCase()) {
      throw new HttpError(403, 'This invite was sent to a different email address.');
    }

    await sql`
      insert into engagement_members (engagement_id, user_id, role)
      values (${invite.engagementId}, ${user.id}, ${invite.role})
      on conflict (engagement_id, user_id) do update set role = excluded.role
    `;
    await sql`update engagement_invites set accepted_at = now() where id = ${invite.id}`;

    res.status(200).json({ engagementId: invite.engagementId });
  } catch (err) {
    sendError(res, err);
  }
}
