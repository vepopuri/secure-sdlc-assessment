// Scope service: the only module that reads/writes which controls are in
// scope for the assessment (localStorage today). Pages must go through
// AppDataContext — never through storage/* directly. Swapping this for a
// real backend later means reimplementing these functions to call an API
// instead; no page code changes.

import type { ScopeSelection } from '../types';
import { listItems, upsertItem } from '../storage/localStore';

const COLLECTION_KEY = 'scope';

export async function list(): Promise<ScopeSelection[]> {
  return listItems<ScopeSelection>(COLLECTION_KEY);
}

/** Replaces the full set of in-scope control ids for a framework. */
export async function setIncluded(frameworkId: string, includedControlIds: string[]): Promise<ScopeSelection> {
  const record: ScopeSelection = { id: frameworkId, frameworkId, includedControlIds };
  upsertItem(COLLECTION_KEY, record);
  return record;
}
