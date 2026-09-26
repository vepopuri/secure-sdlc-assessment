import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSql } from '../../_lib/db';
import { getSessionUser } from '../../_lib/auth';
import { sendError } from '../../_lib/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const action = req.query.action;
    if (action === 'session') {
      const user = await getSessionUser(req);
      res.status(200).json({ debug: 'db-and-auth-only', user });
      return;
    }
    if (action === 'ping-db') {
      const sql = getSql();
      const rows = await sql`select 1 as ok`;
      res.status(200).json({ rows });
      return;
    }
    res.status(404).json({ error: 'debug: unknown action' });
  } catch (err) {
    sendError(res, err);
  }
}
