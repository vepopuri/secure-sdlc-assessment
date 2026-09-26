import type { VercelRequest, VercelResponse } from '@vercel/node';
import { destroySession, clearSessionCookie } from '../_lib/auth';
import { sendError } from '../_lib/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }
  try {
    await destroySession(req);
    clearSessionCookie(res);
    res.status(204).end();
  } catch (err) {
    sendError(res, err);
  }
}
