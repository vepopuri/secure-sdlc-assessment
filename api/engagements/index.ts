import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSql } from '../_lib/db';
import { requireSession, sendError, HttpError } from '../_lib/authz';

interface CreateEngagementBody {
  name?: string;
  clientName?: string;
  frameworkIds?: string[];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const user = await requireSession(req);
    const sql = getSql();

    if (req.method === 'GET') {
      const rows = await sql`
        select
          e.id, e.name, e.client_name as "clientName", e.framework_ids as "frameworkIds",
          e.updated_at as "updatedAt", m.role,
          (select count(*)::int from engagement_members where engagement_id = e.id) as "memberCount"
        from engagements e
        join engagement_members m on m.engagement_id = e.id
        where m.user_id = ${user.id}
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
        values (${name}, ${clientName}, ${frameworkIds}::text[], ${user.id})
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
        values (${engagement.id}, ${user.id}, 'owner', ${user.id})
      `;

      res.status(201).json({ engagement: { ...engagement, role: 'owner', memberCount: 1 } });
      return;
    }

    res.status(405).json({ error: 'Method not allowed. Use GET or POST.' });
  } catch (err) {
    sendError(res, err);
  }
}
