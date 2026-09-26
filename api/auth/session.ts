import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSessionUser } from '../_lib/auth';
import { sendError } from '../_lib/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed. Use GET.' });
    return;
  }
  try {
    const user = await getSessionUser(req);
    if (!user) {
      res.status(401).json({ error: 'Not authenticated.' });
      return;
    }
    res.status(200).json({ user });
  } catch (err) {
    sendError(res, err);
  }
}
