import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomBytes, createHash } from 'node:crypto';
import { getSql } from '../../_lib/db';
import { requireSession, requireMember, requireRole, sendError, HttpError, type EngagementRole } from '../../_lib/authz';

const VALID_ROLES: EngagementRole[] = ['owner', 'reviewer', 'viewer'];
const INVITE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

interface InviteBody {
  email?: string;
  role?: EngagementRole;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const user = await requireSession(req);
    const engagementId = req.query.id as string;
    const sql = getSql();

    if (req.method === 'GET') {
      await requireMember(engagementId, user.id);
      const members = await sql`
        select m.user_id as "userId", m.role, u.email, u.display_name as "displayName"
        from engagement_members m
        join users u on u.id = m.user_id
        where m.engagement_id = ${engagementId}
        order by u.display_name
      `;
      const invites = await sql`
        select id, email, role, expires_at as "expiresAt"
        from engagement_invites
        where engagement_id = ${engagementId} and accepted_at is null and expires_at > now()
        order by created_at desc
      `;
      res.status(200).json({ members, invites });
      return;
    }

    if (req.method === 'POST') {
      await requireRole(engagementId, user.id, ['owner']);
      const body = (req.body ?? {}) as InviteBody;
      const email = body.email?.trim().toLowerCase();
      const role = body.role;
      if (!email || !email.includes('@')) throw new HttpError(400, 'A valid email is required.');
      if (!role || !VALID_ROLES.includes(role)) throw new HttpError(400, 'A valid role is required.');

      const existingUser = (await sql`select id from users where lower(email) = ${email} limit 1`)[0] as
        | { id: string }
        | undefined;

      if (existingUser) {
        const alreadyMember = (
          await sql`
            select 1 from engagement_members where engagement_id = ${engagementId} and user_id = ${existingUser.id} limit 1
          `
        )[0];
        if (alreadyMember) throw new HttpError(409, 'This person is already a member of the engagement.');

        const rows = await sql`
          insert into engagement_members (engagement_id, user_id, role, invited_by)
          values (${engagementId}, ${existingUser.id}, ${role}, ${user.id})
          returning user_id as "userId", role
        `;
        res.status(201).json({ member: { ...rows[0], email } });
        return;
      }

      const existingInvite = (
        await sql`
          select 1 from engagement_invites
          where engagement_id = ${engagementId} and lower(email) = ${email} and accepted_at is null
          limit 1
        `
      )[0];
      if (existingInvite) throw new HttpError(409, 'There is already a pending invite for this email.');

      const token = randomBytes(32).toString('hex');
      const tokenHash = createHash('sha256').update(token).digest('hex');
      const expiresAt = new Date(Date.now() + INVITE_TTL_MS).toISOString();
      const rows = await sql`
        insert into engagement_invites (engagement_id, email, role, invited_by, token_hash, expires_at)
        values (${engagementId}, ${email}, ${role}, ${user.id}, ${tokenHash}, ${expiresAt})
        returning id, email, role, expires_at as "expiresAt"
      `;

      // No email delivery yet (Resend/magic-link is a later phase) — hand
      // back the raw token so the inviter can share the accept link
      // manually until then.
      res.status(201).json({ invite: rows[0], token });
      return;
    }

    res.status(405).json({ error: 'Method not allowed. Use GET or POST.' });
  } catch (err) {
    sendError(res, err);
  }
}
