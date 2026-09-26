// Scope service: the only module that reads/writes which controls are in
// scope for the assessment (localStorage today). Pages must go through
// AppDataContext — never through storage/* directly. Swapping this for a
// real backend later means reimplementing these functions to call an API
// instead; no page code changes.

import type { ScopeDocument, ScopeSelection } from '../types';
import { listItems, upsertItem, getItem } from '../storage/localStore';

const COLLECTION_KEY = 'scope';
const DOCUMENT_COLLECTION_KEY = 'scopeDocument';
const DOCUMENT_ID = 'engagement-scope';

export async function list(): Promise<ScopeSelection[]> {
  return listItems<ScopeSelection>(COLLECTION_KEY);
}

/** Replaces the full set of in-scope control ids for a framework. */
export async function setIncluded(frameworkId: string, includedControlIds: string[]): Promise<ScopeSelection> {
  const record: ScopeSelection = { id: frameworkId, frameworkId, includedControlIds };
  upsertItem(COLLECTION_KEY, record);
  return record;
}

export async function getDocument(): Promise<ScopeDocument | undefined> {
  return getItem<ScopeDocument>(DOCUMENT_COLLECTION_KEY, DOCUMENT_ID);
}

/** Replaces the free-text engagement scope document. */
export async function setDocument(text: string): Promise<ScopeDocument> {
  const record: ScopeDocument = { id: DOCUMENT_ID, text, updatedAt: new Date().toISOString() };
  upsertItem(DOCUMENT_COLLECTION_KEY, record);
  return record;
}
