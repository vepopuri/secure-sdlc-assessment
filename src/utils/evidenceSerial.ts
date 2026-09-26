// Assigns each evidence item a stable REF-### number by insertion order
// (oldest first), shared by the Evidence Library grid and the report/PPTX
// appendix so the same item always cites the same reference number
// everywhere it's mentioned.

import type { Evidence } from '../types';

export function computeEvidenceSerials(evidence: Evidence[]): Map<string, number> {
  const serials = new Map<string, number>();
  [...evidence]
    .sort((a, b) => a.addedAt.localeCompare(b.addedAt))
    .forEach((item, i) => serials.set(item.id, i + 1));
  return serials;
}

export function formatSerial(n: number): string {
  return `REF-${String(n).padStart(3, '0')}`;
}
