// Tiny migration runner: applies db/migrations/*.sql files in order,
// tracking what's already applied in a schema_migrations table. No
// Prisma Migrate/Flyway, consistent with this project's no-ORM approach.
//
// Usage: DATABASE_URL=<neon connection string> npm run migrate

import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, '..', 'db', 'migrations');

async function main() {
  const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!connectionString) {
    console.error('DATABASE_URL (or POSTGRES_URL) is not set. Set it to your Neon connection string and re-run.');
    process.exitCode = 1;
    return;
  }

  const sql = postgres(connectionString, { ssl: 'require' });

  try {
    await sql`
      create table if not exists schema_migrations (
        filename text primary key,
        applied_at timestamptz not null default now()
      )
    `;

    const appliedResult = await sql<{ filename: string }[]>`select filename from schema_migrations`;
    const applied = new Set(appliedResult.map((r) => r.filename));

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
      await sql.begin(async (tx) => {
        await tx.unsafe(sqlText);
        await tx`insert into schema_migrations (filename) values (${file})`;
      });
    }

    console.log('Migrations up to date.');
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
