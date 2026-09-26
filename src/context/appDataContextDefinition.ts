// The React context object itself, kept in its own module (separate from the
// provider component and the `useAppData` hook) so each file only exports one
// kind of thing — keeps Fast Refresh working cleanly.

import { createContext } from 'react';
import type { Evidence, Observation, ScopeDocument, ScopeSelection } from '../types';
import type { AddFileInput, AddNoteInput } from '../services/evidenceService';
import type { UpsertObservationInput } from '../services/assessmentService';

export interface AppDataContextValue {
  evidence: Evidence[];
  observations: Observation[];
  scope: ScopeSelection[];
  scopeDocument: ScopeDocument | undefined;
  loading: boolean;
  addEvidenceFile: (input: AddFileInput) => Promise<Evidence>;
  addEvidenceNote: (input: AddNoteInput) => Promise<Evidence>;
  removeEvidence: (id: string) => Promise<void>;
  getEvidenceObjectUrl: (id: string) => Promise<string | undefined>;
  upsertObservation: (input: UpsertObservationInput) => Promise<Observation>;
  getObservation: (frameworkId: string, controlId: string) => Observation | undefined;
  setScopeIncluded: (frameworkId: string, includedControlIds: string[]) => Promise<ScopeSelection>;
  updateScopeDocument: (partial: Partial<Omit<ScopeDocument, 'id'>>) => Promise<ScopeDocument>;
  setScopeDocumentAttachment: (file: File) => Promise<ScopeDocument>;
  removeScopeDocumentAttachment: () => Promise<ScopeDocument>;
  getScopeDocumentAttachmentUrl: () => Promise<string | undefined>;
  readScopeDocumentAttachmentText: () => Promise<string | undefined>;
}

export const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);
