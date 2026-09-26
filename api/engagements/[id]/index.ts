import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSql } from '../../_lib/db';
import { requireSession, requireMember, requireRole, sendError, HttpError } from '../../_lib/authz';

interface UpdateEngagementBody {
  name?: string;
  clientName?: string;
  frameworkIds?: string[];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const user = await requireSession(req);
    const engagementId = req.query.id as string;
    const sql = getSql();

    if (req.method === 'GET') {
      const role = await requireMember(engagementId, user.id);
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
      await requireRole(engagementId, user.id, ['owner']);
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
      await requireRole(engagementId, user.id, ['owner']);
      await sql`delete from engagements where id = ${engagementId}`;
      res.status(204).end();
      return;
    }

    res.status(405).json({ error: 'Method not allowed. Use GET, PATCH, or DELETE.' });
  } catch (err) {
    sendError(res, err);
  }
}
