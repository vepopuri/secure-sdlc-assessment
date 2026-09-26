// Tiny migration runner: applies db/migrations/*.sql files in order,
// tracking what's already applied in a schema_migrations table. No
// Prisma Migrate/Flyway, consistent with this project's no-ORM approach.
//
// Usage: DATABASE_URL=<neon connection string> npm run migrate

import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, '..', 'db', 'migrations');

async function main() {
  const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!connectionString) {
    console.error('DATABASE_URL (or POSTGRES_URL) is not set. Set it to your Neon connection string and re-run.');
    process.exitCode = 1;
    return;
  }

  const client = new Client({ connectionString });
  await client.connect();

  try {
    await client.query(`
      create table if not exists schema_migrations (
        filename text primary key,
        applied_at timestamptz not null default now()
      )
    `);

    const appliedResult = await client.query<{ filename: string }>('select filename from schema_migrations');
    const applied = new Set(appliedResult.rows.map((r) => r.filename));

    const files = readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`skip  ${file} (already applied)`);
        continue;
      }
      const sqlText = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');
      console.log(`apply ${file}`);
      await client.query('begin');
      try {
        await client.query(sqlText);
        await client.query('insert into schema_migrations (filename) values ($1)', [file]);
        await client.query('commit');
      } catch (err) {
        await client.query('rollback');
        throw err;
      }
    }

    console.log('Migrations up to date.');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
