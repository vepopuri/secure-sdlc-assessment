// Shared Postgres access for every api/*.ts function in this project.
//
// Uses `postgres` (postgres.js): a zero-dependency, pure-JS driver with no
// conditional/native requires. Both `pg` and `@neondatabase/serverless`
// crashed with a bare FUNCTION_INVOCATION_FAILED on every single request
// once actually deployed to this project's Vercel Node runtime, merely by
// being imported (never even called) — despite working perfectly when run
// locally via `tsx`. postgres.js sidesteps whatever bundling/tracing issue
// those packages hit, and its `sql` tagged template is a closer match to
// this codebase's call sites than either alternative.

import postgres from 'postgres';

export type SqlFn = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Record<string, unknown>[]>;

let sqlInstance: ReturnType<typeof postgres> | null = null;

function getClient() {
  if (!sqlInstance) {
    const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
    if (!connectionString) {
      throw new Error(
        'DATABASE_URL (or POSTGRES_URL) is not set. Connect a Postgres database to this Vercel project (Storage tab), then redeploy.',
      );
    }
    sqlInstance = postgres(connectionString, { ssl: 'require' });
  }
  return sqlInstance;
}

export function getSql(): SqlFn {
  return async (strings, ...values) => {
    const client = getClient();
    const rows = await client(strings, ...values);
    return rows as unknown as Record<string, unknown>[];
  };
}
