import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSql } from '../../_lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = req.query.action;
  if (action === 'session') {
    res.status(200).json({ debug: 'only-getsql-import', hasSql: typeof getSql === 'function' });
    return;
  }
  res.status(404).json({ error: 'debug: unknown action' });
}
