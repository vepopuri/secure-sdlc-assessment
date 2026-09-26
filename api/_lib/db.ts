// Shared Postgres access for every api/*.ts function in this project.
//
// Uses `pg` (node-postgres), not `@neondatabase/serverless`: the latter
// crashed with a bare FUNCTION_INVOCATION_FAILED on every single request
// once actually deployed to this project's Vercel Node runtime (it works
// perfectly when run locally, e.g. via `npm run migrate` or `tsx`, which
// is what made this so hard to track down — the failure is specific to
// Vercel's deployed bundle, not the package itself in general). `pg` is
// the most widely deployed Postgres client on Vercel Node functions.
//
// This exports a `sql` tagged-template function shaped like neon's, so
// every call site (`sql\`select ...\``) didn't need to change.

import { Client } from 'pg';

export type SqlFn = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Record<string, unknown>[]>;

let clientPromise: Promise<Client> | null = null;

async function getClient(): Promise<Client> {
  if (!clientPromise) {
    const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
    if (!connectionString) {
      throw new Error(
        'DATABASE_URL (or POSTGRES_URL) is not set. Connect a Postgres database to this Vercel project (Storage tab), then redeploy.',
      );
    }
    const client = new Client({ connectionString });
    clientPromise = client.connect().then(() => client);
  }
  return clientPromise;
}

export function getSql(): SqlFn {
  return async (strings, ...values) => {
    const client = await getClient();
    let text = strings[0];
    for (let i = 0; i < values.length; i++) {
      text += `$${i + 1}${strings[i + 1]}`;
    }
    const result = await client.query(text, values);
    return result.rows;
  };
}
