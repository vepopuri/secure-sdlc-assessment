// Scope service: the only module that reads/writes which controls are in
// scope for the assessment, and the engagement's intake/scope document
// (localStorage for metadata, IndexedDB for an optional attached file).
// Pages must go through AppDataContext — never through storage/* directly.
// Swapping this for a real backend later means reimplementing these
// functions to call an API instead; no page code changes.

import type { ScopeDocument, ScopeSelection } from '../types';
import { listItems, upsertItem, getItem } from '../storage/localStore';
import { putBlob, getBlob, deleteBlob } from '../storage/idb';

const COLLECTION_KEY = 'scope';
const DOCUMENT_COLLECTION_KEY = 'scopeDocument';
const DOCUMENT_ID = 'engagement-scope';
const ATTACHMENT_BLOB_ID = 'scope-document-attachment';

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

function defaultDocument(): ScopeDocument {
  return {
    id: DOCUMENT_ID,
    reviewLevel: null,
    applicationType: '',
    complianceRequirements: [],
    text: '',
    updatedAt: new Date().toISOString(),
  };
}

/** Merges the given fields into the existing scope document (or creates one) and persists it. */
export async function updateDocument(partial: Partial<Omit<ScopeDocument, 'id'>>): Promise<ScopeDocument> {
  const existing = getItem<ScopeDocument>(DOCUMENT_COLLECTION_KEY, DOCUMENT_ID) ?? defaultDocument();
  const merged: ScopeDocument = { ...existing, ...partial, id: DOCUMENT_ID, updatedAt: new Date().toISOString() };
  upsertItem(DOCUMENT_COLLECTION_KEY, merged);
  return merged;
}

/** Attaches (replacing any previous) an uploaded scope document file. */
export async function setDocumentAttachment(file: File): Promise<ScopeDocument> {
  await putBlob(ATTACHMENT_BLOB_ID, file);
  return updateDocument({
    attachmentFileName: file.name,
    attachmentMimeType: file.type || 'application/octet-stream',
    attachmentSizeBytes: file.size,
  });
}

export async function removeDocumentAttachment(): Promise<ScopeDocument> {
  await deleteBlob(ATTACHMENT_BLOB_ID);
  return updateDocument({
    attachmentFileName: undefined,
    attachmentMimeType: undefined,
    attachmentSizeBytes: undefined,
  });
}

/**
 * Returns a temporary object URL for the attached scope document file, or
 * undefined if none is attached. Caller is responsible for revoking the URL
 * when done with it.
 */
export async function getDocumentAttachmentUrl(): Promise<string | undefined> {
  const blob = await getBlob(ATTACHMENT_BLOB_ID);
  if (!blob) return undefined;
  return URL.createObjectURL(blob);
}

/** Reads the attached file's text content (for auto-filling the scope description from a plain-text upload). */
export async function readDocumentAttachmentText(): Promise<string | undefined> {
  const blob = await getBlob(ATTACHMENT_BLOB_ID);
  if (!blob) return undefined;
  return blob.text();
}
