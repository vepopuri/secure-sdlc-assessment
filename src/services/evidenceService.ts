// Evidence service: the only module that reads/writes evidence data (metadata in
// localStorage, file bytes in IndexedDB). Pages must go through AppDataContext,
// which wraps these functions — never through storage/* directly.
//
// Swapping this for a real backend later means reimplementing these functions to
// call an API instead of localStorage/IndexedDB; no page code needs to change.

import type { Evidence, EvidenceKind } from '../types';
import { listItems, upsertItem, removeItem, getItem } from '../storage/localStore';
import { putBlob, getBlob, deleteBlob } from '../storage/idb';

const COLLECTION_KEY = 'evidence';

function newId(): string {
  return `ev-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function list(): Promise<Evidence[]> {
  return [...listItems<Evidence>(COLLECTION_KEY)].sort((a, b) => b.addedAt.localeCompare(a.addedAt));
}

export async function get(id: string): Promise<Evidence | undefined> {
  return getItem<Evidence>(COLLECTION_KEY, id);
}

export interface AddFileInput {
  file: File;
  title: string;
  kind: EvidenceKind;
  tags: string[];
  notes?: string;
}

export async function addFile(input: AddFileInput): Promise<Evidence> {
  const id = newId();
  await putBlob(id, input.file);
  const evidence: Evidence = {
    id,
    kind: input.kind,
    title: input.title,
    fileName: input.file.name,
    mimeType: input.file.type || 'application/octet-stream',
    sizeBytes: input.file.size,
    notes: input.notes ?? '',
    tags: input.tags,
    addedAt: new Date().toISOString(),
    hasBlob: true,
  };
  upsertItem(COLLECTION_KEY, evidence);
  return evidence;
}

export interface AddNoteInput {
  title: string;
  body: string;
  tags: string[];
  notes?: string;
}

export async function addNote(input: AddNoteInput): Promise<Evidence> {
  const evidence: Evidence = {
    id: newId(),
    kind: 'interview-note',
    title: input.title,
    notes: input.notes ?? '',
    tags: input.tags,
    addedAt: new Date().toISOString(),
    hasBlob: false,
    noteBody: input.body,
  };
  upsertItem(COLLECTION_KEY, evidence);
  return evidence;
}

export async function remove(id: string): Promise<void> {
  removeItem<Evidence>(COLLECTION_KEY, id);
  await deleteBlob(id);
}

/**
 * Returns a temporary object URL for the evidence's file blob, or undefined if it
 * has no blob (e.g. an interview note). Caller is responsible for revoking the URL
 * (e.g. `URL.revokeObjectURL`) when done with it.
 */
export async function getObjectUrl(id: string): Promise<string | undefined> {
  const blob = await getBlob(id);
  if (!blob) return undefined;
  return URL.createObjectURL(blob);
}
