// Assessment service: the only module that reads/writes observation data
// (localStorage today). Pages must go through AppDataContext — never through
// storage/* directly. Swapping this for a real backend later means
// reimplementing these functions to call an API instead; no page code changes.

import type { EvidenceLink, MaturityRating, Observation, ObservationStatus } from '../types';
import { observationId } from '../types';
import { listItems, upsertItem, getItem } from '../storage/localStore';

const COLLECTION_KEY = 'observations';

/** Normalizes a stored observation, migrating the older flat `evidenceIds: string[]` shape in place. */
function normalize(raw: Observation & { evidenceIds?: string[] }): Observation {
  if (Array.isArray(raw.evidenceLinks)) return raw;
  const legacyIds = Array.isArray(raw.evidenceIds) ? raw.evidenceIds : [];
  return { ...raw, evidenceLinks: legacyIds.map((evidenceId): EvidenceLink => ({ evidenceId })) };
}

export async function list(frameworkId?: string): Promise<Observation[]> {
  const all = listItems<Observation>(COLLECTION_KEY).map(normalize);
  return frameworkId ? all.filter((o) => o.frameworkId === frameworkId) : all;
}

export async function get(frameworkId: string, controlId: string): Promise<Observation | undefined> {
  const raw = getItem<Observation>(COLLECTION_KEY, observationId(frameworkId, controlId));
  return raw ? normalize(raw) : undefined;
}

export interface UpsertObservationInput {
  frameworkId: string;
  controlId: string;
  status?: ObservationStatus;
  rating?: MaturityRating | null;
  notes?: string;
  evidenceLinks?: EvidenceLink[];
  autoSuggested?: boolean;
}

/** Merges the given fields into the existing observation (or creates one) and persists it. */
export async function upsert(input: UpsertObservationInput): Promise<Observation> {
  const id = observationId(input.frameworkId, input.controlId);
  const existingRaw = getItem<Observation>(COLLECTION_KEY, id);
  const existing = existingRaw ? normalize(existingRaw) : undefined;
  const merged: Observation = {
    id,
    frameworkId: input.frameworkId,
    controlId: input.controlId,
    status: input.status ?? existing?.status ?? 'not-started',
    rating: input.rating !== undefined ? input.rating : (existing?.rating ?? null),
    notes: input.notes !== undefined ? input.notes : (existing?.notes ?? ''),
    evidenceLinks: input.evidenceLinks !== undefined ? input.evidenceLinks : (existing?.evidenceLinks ?? []),
    autoSuggested: input.autoSuggested !== undefined ? input.autoSuggested : (existing?.autoSuggested ?? false),
    updatedAt: new Date().toISOString(),
  };
  upsertItem(COLLECTION_KEY, merged);
  return merged;
}
