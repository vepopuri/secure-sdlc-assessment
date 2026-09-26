import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSql } from '../_lib/db';
import { hashPassword } from '../_lib/auth';
import { createVerificationToken } from '../_lib/verification';
import { sendVerificationEmail } from '../_lib/email';
import { sendError, HttpError } from '../_lib/authz';

interface SignupBody {
  email?: string;
  password?: string;
  displayName?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  try {
    const body = (req.body ?? {}) as SignupBody;
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const displayName = body.displayName?.trim();

    if (!email || !email.includes('@')) throw new HttpError(400, 'A valid email is required.');
    if (!password || password.length < 8) throw new HttpError(400, 'Password must be at least 8 characters.');
    if (!displayName) throw new HttpError(400, 'Display name is required.');

    const sql = getSql();
    const existing = await sql`select id from users where lower(email) = ${email} limit 1`;
    if (existing.length > 0) throw new HttpError(409, 'An account with this email already exists.');

    const passwordHash = await hashPassword(password);
    const rows = await sql`
      insert into users (email, password_hash, display_name)
      values (${email}, ${passwordHash}, ${displayName})
      returning id, email, display_name as "displayName"
    `;
    const user = rows[0] as { id: string; email: string; displayName: string };

    // No session is created here on purpose: the account can't be signed
    // into until the email is verified (see api/auth/verify-email.ts).
    const verificationToken = await createVerificationToken(user.id);
    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({ status: 'verification-required', email: user.email });
  } catch (err) {
    sendError(res, err);
  }
}
