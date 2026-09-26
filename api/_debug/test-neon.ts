import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSql } from '../_lib/db';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const sql = getSql();
    const rows = await sql`select 1 as ok`;
    res.status(200).json({ ok: true, rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: err instanceof Error ? err.message : String(err) });
  }
}
