import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSql } from '../_lib/db';
import { createVerificationToken } from '../_lib/verification';
import { sendVerificationEmail } from '../_lib/email';
import { sendError, HttpError } from '../_lib/authz';

interface ResendBody {
  email?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  try {
    const body = (req.body ?? {}) as ResendBody;
    const email = body.email?.trim().toLowerCase();
    if (!email || !email.includes('@')) throw new HttpError(400, 'A valid email is required.');

    const sql = getSql();
    const rows = await sql`
      select id, email, email_verified_at as "emailVerifiedAt" from users where lower(email) = ${email} limit 1
    `;
    const user = rows[0] as { id: string; email: string; emailVerifiedAt: string | null } | undefined;

    // Always respond the same way regardless of whether the account exists
    // or is already verified, to avoid leaking which emails have accounts.
    if (user && !user.emailVerifiedAt) {
      const token = await createVerificationToken(user.id);
      await sendVerificationEmail(user.email, token);
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    sendError(res, err);
  }
}
