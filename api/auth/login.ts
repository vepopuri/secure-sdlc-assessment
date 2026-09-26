import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSql } from '../_lib/db';
import { verifyPassword, createSession, setSessionCookie } from '../_lib/auth';
import { sendError, HttpError } from '../_lib/authz';

interface LoginBody {
  email?: string;
  password?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  try {
    const body = (req.body ?? {}) as LoginBody;
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    if (!email || !password) throw new HttpError(400, 'Email and password are required.');

    const sql = getSql();
    const rows = await sql`
      select id, email, password_hash as "passwordHash", display_name as "displayName", email_verified_at as "emailVerifiedAt"
      from users where lower(email) = ${email} limit 1
    `;
    const user = rows[0] as
      | { id: string; email: string; passwordHash: string | null; displayName: string; emailVerifiedAt: string | null }
      | undefined;

    // Deliberately identical error for "no such user" and "wrong password" —
    // never reveal which one was wrong.
    if (!user || !user.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
      throw new HttpError(401, 'Invalid email or password.');
    }

    if (!user.emailVerifiedAt) {
      throw new HttpError(403, 'Please verify your email before signing in.', 'EMAIL_NOT_VERIFIED');
    }

    const userAgent = typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined;
    const token = await createSession(user.id, userAgent);
    setSessionCookie(res, token);

    res.status(200).json({ user: { id: user.id, email: user.email, displayName: user.displayName } });
  } catch (err) {
    sendError(res, err);
  }
}
