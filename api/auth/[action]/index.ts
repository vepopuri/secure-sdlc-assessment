import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PING } from '../../_lib/ping';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = req.query.action;
  if (action === 'session') {
    res.status(200).json({
      debug: 'ping-lib-import-isolation-test',
      nodeVersion: process.version,
      ping: PING,
    });
    return;
  }
  res.status(404).json({ error: 'debug: unknown action' });
}
