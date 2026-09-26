// All engagement endpoints consolidated into one catch-all function:
//   GET/POST   /api/engagements
//   GET/PATCH/DELETE /api/engagements/:id
//   GET/POST   /api/engagements/:id/members
//   PATCH/DELETE /api/engagements/:id/members/:userId
// See api/auth/[action].ts for why (Vercel Hobby plan's 12-function cap).

import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { NeonQueryFunction } from '@neondatabase/serverless';
import { randomBytes, createHash } from 'node:crypto';
import { getSql } from '../_lib/db';
import { requireSession, requireMember, requireRole, sendError, HttpError, type EngagementRole } from '../_lib/authz';

const VALID_ROLES: EngagementRole[] = ['owner', 'reviewer', 'viewer'];
const INVITE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

interface CreateEngagementBody {
  name?: string;
  clientName?: string;
  frameworkIds?: string[];
}

async function handleCollection(req: VercelRequest, res: VercelResponse, userId: string) {
  const sql = getSql();

  if (req.method === 'GET') {
    const rows = await sql`
      select
        e.id, e.name, e.client_name as "clientName", e.framework_ids as "frameworkIds",
        e.updated_at as "updatedAt", m.role,
        (select count(*)::int from engagement_members where engagement_id = e.id) as "memberCount"
      from engagements e
      join engagement_members m on m.engagement_id = e.id
      where m.user_id = ${userId}
      order by e.updated_at desc
    `;
    res.status(200).json({ engagements: rows });
    return;
  }

  if (req.method === 'POST') {
    const body = (req.body ?? {}) as CreateEngagementBody;
    const name = body.name?.trim();
    if (!name) throw new HttpError(400, 'Engagement name is required.');
    const clientName = body.clientName?.trim() || null;
    const frameworkIds = Array.isArray(body.frameworkIds) ? body.frameworkIds : [];

    const rows = await sql`
      insert into engagements (name, client_name, framework_ids, created_by)
      values (${name}, ${clientName}, ${frameworkIds}::text[], ${userId})
      returning id, name, client_name as "clientName", framework_ids as "frameworkIds", updated_at as "updatedAt"
    `;
    const engagement = rows[0] as {
      id: string;
      name: string;
      clientName: string | null;
      frameworkIds: string[];
      updatedAt: string;
    };

    await sql`
      insert into engagement_members (engagement_id, user_id, role, invited_by)
      values (${engagement.id}, ${userId}, 'owner', ${userId})
    `;

    res.status(201).json({ engagement: { ...engagement, role: 'owner', memberCount: 1 } });
    return;
  }

  res.status(405).json({ error: 'Method not allowed. Use GET or POST.' });
}

interface UpdateEngagementBody {
  name?: string;
  clientName?: string;
  frameworkIds?: string[];
}

async function handleEngagement(req: VercelRequest, res: VercelResponse, userId: string, engagementId: string) {
  const sql = getSql();

  if (req.method === 'GET') {
    const role = await requireMember(engagementId, userId);
    const rows = await sql`
      select id, name, client_name as "clientName", framework_ids as "frameworkIds", updated_at as "updatedAt"
      from engagements where id = ${engagementId} limit 1
    `;
    const engagement = rows[0];
    if (!engagement) throw new HttpError(404, 'Engagement not found.');
    res.status(200).json({ engagement: { ...engagement, role } });
    return;
  }

  if (req.method === 'PATCH') {
    await requireRole(engagementId, userId, ['owner']);
    const body = (req.body ?? {}) as UpdateEngagementBody;

    const current = (
      await sql`
        select name, client_name as "clientName", framework_ids as "frameworkIds"
        from engagements where id = ${engagementId} limit 1
      `
    )[0] as { name: string; clientName: string | null; frameworkIds: string[] } | undefined;
    if (!current) throw new HttpError(404, 'Engagement not found.');

    const name = body.name?.trim() || current.name;
    const clientName = body.clientName !== undefined ? body.clientName.trim() || null : current.clientName;
    const frameworkIds = body.frameworkIds !== undefined ? body.frameworkIds : current.frameworkIds;

    const rows = await sql`
      update engagements
      set name = ${name}, client_name = ${clientName}, framework_ids = ${frameworkIds}::text[], updated_at = now()
      where id = ${engagementId}
      returning id, name, client_name as "clientName", framework_ids as "frameworkIds", updated_at as "updatedAt"
    `;
    res.status(200).json({ engagement: rows[0] });
    return;
  }

  if (req.method === 'DELETE') {
    await requireRole(engagementId, userId, ['owner']);
    await sql`delete from engagements where id = ${engagementId}`;
    res.status(204).end();
    return;
  }

  res.status(405).json({ error: 'Method not allowed. Use GET, PATCH, or DELETE.' });
}

interface InviteBody {
  email?: string;
  role?: EngagementRole;
}

async function handleMembers(req: VercelRequest, res: VercelResponse, userId: string, engagementId: string) {
  const sql = getSql();

  if (req.method === 'GET') {
    await requireMember(engagementId, userId);
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
    await requireRole(engagementId, userId, ['owner']);
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
        values (${engagementId}, ${existingUser.id}, ${role}, ${userId})
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
      values (${engagementId}, ${email}, ${role}, ${userId}, ${tokenHash}, ${expiresAt})
      returning id, email, role, expires_at as "expiresAt"
    `;

    // No email delivery yet — hand back the raw token so the inviter can
    // share the accept link manually until this is wired to Resend.
    res.status(201).json({ invite: rows[0], token });
    return;
  }

  res.status(405).json({ error: 'Method not allowed. Use GET or POST.' });
}

interface UpdateRoleBody {
  role?: EngagementRole;
}

async function countOwners(sql: NeonQueryFunction<false, false>, engagementId: string): Promise<number> {
  const rows = await sql`
    select count(*)::int as count from engagement_members where engagement_id = ${engagementId} and role = 'owner'
  `;
  return (rows[0] as { count: number }).count;
}

async function handleMember(
  req: VercelRequest,
  res: VercelResponse,
  userId: string,
  engagementId: string,
  targetUserId: string,
) {
  const sql = getSql();
  await requireRole(engagementId, userId, ['owner']);

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
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const user = await requireSession(req);
    const segments = Array.isArray(req.query.segments) ? req.query.segments : [];

    if (segments.length === 0) return await handleCollection(req, res, user.id);
    if (segments.length === 1) return await handleEngagement(req, res, user.id, segments[0]);
    if (segments.length === 2 && segments[1] === 'members') return await handleMembers(req, res, user.id, segments[0]);
    if (segments.length === 3 && segments[1] === 'members') {
      return await handleMember(req, res, user.id, segments[0], segments[2]);
    }

    res.status(404).json({ error: 'Not found.' });
  } catch (err) {
    sendError(res, err);
  }
}
