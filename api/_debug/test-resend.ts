import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const resend = new Resend('dummy-key-not-used');
    res.status(200).json({ ok: true, hasClient: Boolean(resend) });
  } catch (err) {
    res.status(500).json({ ok: false, error: err instanceof Error ? err.message : String(err) });
  }
}
