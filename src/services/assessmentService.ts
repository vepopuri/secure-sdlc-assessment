// Assessment service: the only module that reads/writes observation data
// (localStorage today). Pages must go through AppDataContext — never through
// storage/* directly. Swapping this for a real backend later means
// reimplementing these functions to call an API instead; no page code changes.

import type { Observation, MaturityRating, ObservationStatus } from '../types';
import { observationId } from '../types';
import { listItems, upsertItem, getItem } from '../storage/localStore';

const COLLECTION_KEY = 'observations';

export async function list(frameworkId?: string): Promise<Observation[]> {
  const all = listItems<Observation>(COLLECTION_KEY);
  return frameworkId ? all.filter((o) => o.frameworkId === frameworkId) : all;
}

export async function get(frameworkId: string, controlId: string): Promise<Observation | undefined> {
  return getItem<Observation>(COLLECTION_KEY, observationId(frameworkId, controlId));
}

export interface UpsertObservationInput {
  frameworkId: string;
  controlId: string;
  status?: ObservationStatus;
  rating?: MaturityRating | null;
  notes?: string;
  evidenceIds?: string[];
}

/** Merges the given fields into the existing observation (or creates one) and persists it. */
export async function upsert(input: UpsertObservationInput): Promise<Observation> {
  const id = observationId(input.frameworkId, input.controlId);
  const existing = getItem<Observation>(COLLECTION_KEY, id);
  const merged: Observation = {
    id,
    frameworkId: input.frameworkId,
    controlId: input.controlId,
    status: input.status ?? existing?.status ?? 'not-started',
    rating: input.rating !== undefined ? input.rating : (existing?.rating ?? null),
    notes: input.notes !== undefined ? input.notes : (existing?.notes ?? ''),
    evidenceIds: input.evidenceIds !== undefined ? input.evidenceIds : (existing?.evidenceIds ?? []),
    updatedAt: new Date().toISOString(),
  };
  upsertItem(COLLECTION_KEY, merged);
  return merged;
}
