// Shared Postgres access for every api/*.ts function in this project.
// Uses Neon's HTTP-based query function (one round trip per call, no
// connection pooling to manage) — the right fit for short-lived serverless
// function invocations. Multi-statement/transactional work (migrations)
// uses `@neondatabase/serverless`'s Client instead; see scripts/migrate.ts.

import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

let cached: NeonQueryFunction<false, false> | null = null;

export function getSql(): NeonQueryFunction<false, false> {
  if (cached) return cached;
  const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL (or POSTGRES_URL) is not set. Connect a Postgres database to this Vercel project (Storage tab), then redeploy.',
    );
  }
  cached = neon(connectionString);
  return cached;
}
