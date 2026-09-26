// Pure, offline "assistant" that drafts a rating and notes for a control from
// its linked evidence. No external service, no network call: it is a keyword
// heuristic over evidence titles/notes, always presented as a suggestion the
// reviewer must confirm or adjust, never as a final answer.

import type { Control, Evidence, MaturityRating } from '../types';
import { MATURITY_LABELS } from '../types';
import { tokenize } from './suggest';

export interface AutoAssessResult {
  rating: MaturityRating;
  notes: string;
  matchedKeywordCount: number;
}

function evidenceHaystack(item: Evidence): string {
  return `${item.title} ${item.notes ?? ''} ${item.noteBody ?? ''}`;
}

/** Drafts a rating and notes for one control from whatever evidence is currently linked to it. */
export function autoAssessControl(control: Control, linkedEvidence: Evidence[]): AutoAssessResult {
  const controlTokens = new Set(tokenize(`${control.name} ${control.description} ${control.question}`));
  const matchedTokens = new Set<string>();
  for (const item of linkedEvidence) {
    for (const token of tokenize(evidenceHaystack(item))) {
      if (controlTokens.has(token)) matchedTokens.add(token);
    }
  }

  let rating: MaturityRating;
  if (linkedEvidence.length === 0) {
    rating = 0;
  } else if (matchedTokens.size === 0) {
    rating = 1;
  } else if (linkedEvidence.length === 1 || matchedTokens.size === 1) {
    rating = 2;
  } else {
    rating = 3;
  }

  const notes = draftNotes(control, linkedEvidence, rating);
  return { rating, notes, matchedKeywordCount: matchedTokens.size };
}

function draftNotes(control: Control, linkedEvidence: Evidence[], rating: MaturityRating): string {
  const prefix = 'Assistant draft. Review and adjust before finalizing.';
  if (linkedEvidence.length === 0) {
    return `${prefix} No evidence is linked yet for ${control.code}. Request supporting documentation, or schedule an interview to ask: "${control.question}"`;
  }
  const titles = linkedEvidence.map((item) => item.title).join(', ');
  const alignment =
    rating >= 3 ? 'closely matches' : rating === 2 ? 'partially matches' : 'shows limited alignment with';
  return `${prefix} Linked evidence (${titles}) ${alignment} the expected practice ("${control.sampleAnswer}"). Suggested rating: ${rating} out of 3 (${MATURITY_LABELS[rating]}). Confirm with the client and adjust as needed.`;
}
