import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSql } from '../_lib/db';
import { createSession, setSessionCookie } from '../_lib/auth';
import { consumeVerificationToken } from '../_lib/verification';
import { sendError, HttpError } from '../_lib/authz';

interface VerifyBody {
  token?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  try {
    const body = (req.body ?? {}) as VerifyBody;
    const token = body.token;
    if (!token) throw new HttpError(400, 'A token is required.');

    const result = await consumeVerificationToken(token);
    if (!result) throw new HttpError(410, 'This verification link is invalid or has expired.');

    const sql = getSql();
    const rows = await sql`select id, email, display_name as "displayName" from users where id = ${result.userId} limit 1`;
    const user = rows[0] as { id: string; email: string; displayName: string };

    const userAgent = typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined;
    const sessionToken = await createSession(user.id, userAgent);
    setSessionCookie(res, sessionToken);

    res.status(200).json({ user });
  } catch (err) {
    sendError(res, err);
  }
}
