import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = req.query.action;
  if (action === 'session') {
    res.status(200).json({
      debug: 'zero-relative-imports-inline-constant',
      nodeVersion: process.version,
      ping: 'pong',
    });
    return;
  }
  res.status(404).json({ error: 'debug: unknown action' });
}
