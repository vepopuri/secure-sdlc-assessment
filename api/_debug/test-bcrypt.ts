import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const hash = await bcrypt.hash('test', 4);
    const ok = await bcrypt.compare('test', hash);
    res.status(200).json({ ok });
  } catch (err) {
    res.status(500).json({ ok: false, error: err instanceof Error ? err.message : String(err) });
  }
}
