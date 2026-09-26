import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSql } from '../../_lib/db';
import bcrypt from 'bcryptjs';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = req.query.action;
  if (action === 'session') {
    // Import both getSql and bcrypt at module scope (done above); this
    // handler itself never calls either, isolating whether the mere
    // import (module load) is what crashes, independent of _lib/auth.ts
    // or _lib/authz.ts.
    res.status(200).json({ debug: 'raw-imports-only', hasSql: typeof getSql === 'function', hasBcrypt: typeof bcrypt === 'object' });
    return;
  }
  res.status(404).json({ error: 'debug: unknown action' });
}
