// Session mechanics: DB-backed opaque tokens (not JWT), so membership/role
// changes can be revoked immediately by deleting the sessions row. The raw
// token only ever lives in an httpOnly cookie; the DB stores its SHA-256
// hash, never the token itself.

import { randomBytes, createHash } from 'node:crypto';
import bcrypt from 'bcryptjs';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSql } from './db.js';

export const SESSION_COOKIE_NAME = 'ssdlc_session';
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const BCRYPT_COST = 12;

// Hand-rolled instead of pulling in the `cookie` package: v2 of that package
// dropped its CommonJS entry point entirely (ESM-only), which risks an
// ERR_REQUIRE_ESM crash at cold start if Vercel's function builder ever
// loads the bundle as CJS — a crash that happens before our own handler
// (and its try/catch) even runs. This is simple enough not to need a
// dependency at all.
function parseCookieHeader(header: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim();
    if (!key) continue;
    const value = part.slice(eq + 1).trim();
    try {
      out[key] = decodeURIComponent(value);
    } catch {
      out[key] = value;
    }
  }
  return out;
}

function serializeSessionCookie(value: string, maxAgeSeconds: number): string {
  const attrs = [`${SESSION_COOKIE_NAME}=${encodeURIComponent(value)}`, 'Path=/', `Max-Age=${maxAgeSeconds}`, 'HttpOnly', 'SameSite=Lax'];
  if (process.env.NODE_ENV === 'production') attrs.push('Secure');
  return attrs.join('; ');
}

export interface SessionUser {
  id: string;
  email: string;
  displayName: string;
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function readSessionToken(req: VercelRequest): string | null {
  const header = req.headers.cookie;
  if (!header) return null;
  const cookies = parseCookieHeader(header);
  return cookies[SESSION_COOKIE_NAME] ?? null;
}

export function setSessionCookie(res: VercelResponse, token: string): void {
  res.setHeader('Set-Cookie', serializeSessionCookie(token, SESSION_DURATION_MS / 1000));
}

export function clearSessionCookie(res: VercelResponse): void {
  res.setHeader('Set-Cookie', serializeSessionCookie('', 0));
}

export async function createSession(userId: string, userAgent: string | undefined): Promise<string> {
  const sql = getSql();
  const token = randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
  await sql`
    insert into sessions (user_id, token_hash, expires_at, user_agent)
    values (${userId}, ${tokenHash}, ${expiresAt}, ${userAgent ?? null})
  `;
  return token;
}

export async function destroySession(req: VercelRequest): Promise<void> {
  const token = readSessionToken(req);
  if (!token) return;
  const sql = getSql();
  await sql`delete from sessions where token_hash = ${hashToken(token)}`;
}

export async function getSessionUser(req: VercelRequest): Promise<SessionUser | null> {
  const token = readSessionToken(req);
  if (!token) return null;

  const sql = getSql();
  const tokenHash = hashToken(token);
  const rows = await sql`
    select u.id, u.email, u.display_name as "displayName", s.expires_at as "expiresAt"
    from sessions s
    join users u on u.id = s.user_id
    where s.token_hash = ${tokenHash}
    limit 1
  `;
  const row = rows[0] as { id: string; email: string; displayName: string; expiresAt: string } | undefined;
  if (!row) return null;
  if (new Date(row.expiresAt).getTime() < Date.now()) return null;

  // Slide the session forward on activity; best-effort, doesn't block the response.
  void sql`update sessions set last_seen_at = now() where token_hash = ${tokenHash}`;

  return { id: row.id, email: row.email, displayName: row.displayName };
}
