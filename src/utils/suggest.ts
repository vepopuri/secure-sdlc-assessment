// Pure, lightweight keyword suggestion: given a free-text scope document,
// propose which controls across the frameworks look relevant. No I/O, no
// external services — simple substring matching so it works entirely
// client-side. It's a starting point for the reviewer to accept or ignore,
// never an automatic decision.

import type { Framework } from '../types';

const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'will', 'have', 'has',
  'are', 'was', 'were', 'been', 'being', 'into', 'onto', 'their', 'they',
  'them', 'these', 'those', 'about', 'across', 'over', 'under', 'also',
  'each', 'such', 'than', 'then', 'when', 'where', 'which', 'while', 'what',
  'your', 'our', 'its', 'not', 'all', 'any', 'can', 'does', 'must', 'should',
  'includes', 'include', 'including', 'engagement', 'assessment', 'scope',
  // Generic secure-SDLC vocabulary — present in most control descriptions
  // regardless of topic, so matching on these alone isn't a useful signal.
  'third', 'party', 'parties', 'management', 'process', 'processes',
  'security', 'software', 'system', 'systems', 'application', 'applications',
  'control', 'controls', 'organization', 'organizational', 'practice',
  'practices', 'requirement', 'requirements', 'policy', 'policies', 'review',
  'reviews', 'compliance', 'product', 'products', 'teams',
]);

const MIN_TOKEN_LENGTH = 5;
/** A control needs at least this many distinct matched keywords to be suggested — a
 * single generic word matching by coincidence isn't a strong enough signal. */
const MIN_MATCHES = 2;

function tokenize(text: string): string[] {
  const words = text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= MIN_TOKEN_LENGTH && !STOPWORDS.has(w));
  return Array.from(new Set(words));
}

export interface SuggestedControl {
  frameworkId: string;
  frameworkShortName: string;
  controlId: string;
  code: string;
  name: string;
  matchedKeywords: string[];
}

/** Suggests controls whose name/description/guidance mention words from the scope document, best matches first. */
export function suggestControls(scopeText: string, frameworks: Framework[]): SuggestedControl[] {
  const tokens = tokenize(scopeText);
  if (tokens.length === 0) return [];

  const suggestions: SuggestedControl[] = [];
  for (const framework of frameworks) {
    for (const fn of framework.functions) {
      for (const control of fn.controls) {
        const haystack = `${control.name} ${control.description} ${control.guidance ?? ''}`.toLowerCase();
        const matched = tokens.filter((token) => haystack.includes(token));
        if (matched.length >= MIN_MATCHES) {
          suggestions.push({
            frameworkId: framework.id,
            frameworkShortName: framework.shortName,
            controlId: control.id,
            code: control.code,
            name: control.name,
            matchedKeywords: matched,
          });
        }
      }
    }
  }

  return suggestions.sort((a, b) => b.matchedKeywords.length - a.matchedKeywords.length);
}
