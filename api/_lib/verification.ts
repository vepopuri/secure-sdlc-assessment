// Email verification tokens: proves control of the address used at signup.
// Same hashed-token-in-DB / raw-token-in-link pattern as sessions, but
// keyed by user_id and single-use (consumed_at), not a login mechanism.

import { randomBytes, createHash } from 'node:crypto';
import { getSql } from './db';

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function createVerificationToken(userId: string): Promise<string> {
  const sql = getSql();
  const token = randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + VERIFICATION_TTL_MS).toISOString();
  await sql`
    insert into email_verification_tokens (user_id, token_hash, expires_at)
    values (${userId}, ${tokenHash}, ${expiresAt})
  `;
  return token;
}

export async function consumeVerificationToken(token: string): Promise<{ userId: string } | null> {
  const sql = getSql();
  const tokenHash = hashToken(token);
  const rows = await sql`
    select id, user_id as "userId"
    from email_verification_tokens
    where token_hash = ${tokenHash} and consumed_at is null and expires_at > now()
    limit 1
  `;
  const row = rows[0] as { id: string; userId: string } | undefined;
  if (!row) return null;

  await sql`update email_verification_tokens set consumed_at = now() where id = ${row.id}`;
  await sql`update users set email_verified_at = now() where id = ${row.userId}`;

  return { userId: row.userId };
}
