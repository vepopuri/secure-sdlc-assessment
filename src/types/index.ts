// Core domain model shared across all frameworks and pages.

/** Normalized maturity scale used for every framework, regardless of its native catalog structure. */
export type MaturityRating = 0 | 1 | 2 | 3;

export const MATURITY_LABELS: Record<MaturityRating, string> = {
  0: 'Not Implemented',
  1: 'Partially Implemented',
  2: 'Largely Implemented',
  3: 'Fully Implemented',
};

export interface Control {
  id: string;
  code: string;
  name: string;
  description: string;
  guidance?: string;
  /** The question a reviewer would ask the client to assess this control. */
  question: string;
  /** An example of what a strong, well-implemented answer looks like — calibration for reviewers. */
  sampleAnswer: string;
}

export interface FrameworkFunction {
  id: string;
  code: string;
  name: string;
  description: string;
  controls: Control[];
}

export interface Framework {
  id: string;
  name: string;
  shortName: string;
  version: string;
  description: string;
  reference: string;
  functions: FrameworkFunction[];
}

export type ObservationStatus = 'not-started' | 'in-progress' | 'complete';

/** One piece of evidence linked to an observation, optionally pointing at where in it — a page, section, or timestamp. */
export interface EvidenceLink {
  evidenceId: string;
  section?: string;
}

export interface Observation {
  id: string; // `${frameworkId}:${controlId}`
  frameworkId: string;
  controlId: string;
  status: ObservationStatus;
  rating: MaturityRating | null;
  notes: string;
  evidenceLinks: EvidenceLink[];
  updatedAt: string; // ISO timestamp
}

export type EvidenceKind = 'document' | 'interview-note' | 'image' | 'other';

export interface Evidence {
  id: string;
  kind: EvidenceKind;
  title: string;
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  notes?: string;
  tags: string[];
  addedAt: string; // ISO timestamp
  hasBlob: boolean;
  /** For interview notes: the note body text itself (stored as metadata, not a blob). */
  noteBody?: string;
}

export function observationId(frameworkId: string, controlId: string): string {
  return `${frameworkId}:${controlId}`;
}

/**
 * Which controls of a framework are in scope for this assessment engagement.
 * Absence of a record for a framework means "everything is in scope" (the
 * default) — a record only exists once the scope has been explicitly edited.
 */
export interface ScopeSelection {
  id: string; // = frameworkId
  frameworkId: string;
  includedControlIds: string[];
}

export type ReviewLevel = 'application' | 'organization';

/**
 * The engagement's intake profile plus its free-text scope description —
 * what's being assessed, boundaries, exclusions, and (optionally) an
 * uploaded scope document. Independent of the per-control ScopeSelection
 * checklist: it's reference material a reviewer can write once, copy
 * elsewhere, and consult later, and it can suggest which controls to
 * include rather than requiring them to be picked by hand.
 */
export interface ScopeDocument {
  id: 'engagement-scope';
  reviewLevel: ReviewLevel | null;
  applicationType: string;
  complianceRequirements: string[];
  text: string;
  attachmentFileName?: string;
  attachmentMimeType?: string;
  attachmentSizeBytes?: number;
  updatedAt: string; // ISO timestamp
}
