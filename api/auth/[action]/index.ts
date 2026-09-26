// All auth endpoints consolidated into one dynamic-route function
// (/api/auth/signup, /login, /logout, /session, /verify-email,
// /resend-verification all still work as before). This project is on
// Vercel's Hobby plan, which caps a deployment at 12 Serverless
// Functions; splitting every endpoint into its own file blew through
// that limit; consolidating by resource keeps the count low with
// plenty of headroom for future endpoints.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSql } from '../../lib/db.js';
import {
  hashPassword,
  verifyPassword,
  createSession,
  setSessionCookie,
  clearSessionCookie,
  destroySession,
  getSessionUser,
} from '../../lib/auth.js';
import { createVerificationToken, consumeVerificationToken } from '../../lib/verification.js';
import { sendVerificationEmail } from '../../lib/email.js';
import { sendError, HttpError } from '../../lib/authz.js';

interface SignupBody {
  email?: string;
  password?: string;
  displayName?: string;
}

async function handleSignup(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }
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
  // into until the email is verified.
  const verificationToken = await createVerificationToken(user.id);
  await sendVerificationEmail(user.email, verificationToken);

  res.status(201).json({ status: 'verification-required', email: user.email });
}

interface LoginBody {
  email?: string;
  password?: string;
}

async function handleLogin(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }
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
}

async function handleLogout(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }
  await destroySession(req);
  clearSessionCookie(res);
  res.status(204).end();
}

async function handleSession(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed. Use GET.' });
    return;
  }
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: 'Not authenticated.' });
    return;
  }
  res.status(200).json({ user });
}

interface VerifyBody {
  token?: string;
}

async function handleVerifyEmail(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }
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
}

interface ResendBody {
  email?: string;
}

async function handleResendVerification(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }
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
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const action = req.query.action;
    switch (action) {
      case 'signup':
        return await handleSignup(req, res);
      case 'login':
        return await handleLogin(req, res);
      case 'logout':
        return await handleLogout(req, res);
      case 'session':
        return await handleSession(req, res);
      case 'verify-email':
        return await handleVerifyEmail(req, res);
      case 'resend-verification':
        return await handleResendVerification(req, res);
      default:
        res.status(404).json({ error: 'Not found.' });
    }
  } catch (err) {
    sendError(res, err);
  }
}
