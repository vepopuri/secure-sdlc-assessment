import type { VercelRequest, VercelResponse } from '@vercel/node';

// TEMP DEBUG: explicitly force the Node.js runtime, ruling out this
// project's functions accidentally running under Vercel's Edge Runtime
// (which has no node:net/node:tls, exactly matching the symptom: pure
// computation like bcryptjs works, any Postgres client crashes).
export const config = { runtime: 'nodejs' };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    debug: 'runtime-check',
    action: req.query?.action,
    isEdgeRuntime: typeof (globalThis as any).EdgeRuntime !== 'undefined',
    hasProcessVersions: typeof process !== 'undefined' && typeof process.versions !== 'undefined',
    nodeVersion: typeof process !== 'undefined' ? process.version : 'no-process',
  });
}
