import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = req.query.action;
  if (action === 'session') {
    res.status(200).json({ debug: 'bcrypt-only-no-db', hasBcrypt: typeof bcrypt === 'object' });
    return;
  }
  res.status(404).json({ error: 'debug: unknown action' });
}
