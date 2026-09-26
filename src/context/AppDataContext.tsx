// The single provider every page mounts under to read/write persisted data.
// It wraps evidenceService/assessmentService — pages never import those
// services (or storage/*) directly. When a real backend replaces the
// service internals, this file and the pages below it stay unchanged.

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Evidence, Observation, ScopeDocument, ScopeSelection } from '../types';
import * as evidenceService from '../services/evidenceService';
import * as assessmentService from '../services/assessmentService';
import * as scopeService from '../services/scopeService';
import type { AddFileInput, AddNoteInput } from '../services/evidenceService';
import type { UpsertObservationInput } from '../services/assessmentService';
import { observationId } from '../types';
import { AppDataContext, type AppDataContextValue } from './appDataContextDefinition';

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [scope, setScope] = useState<ScopeSelection[]>([]);
  const [scopeDocument, setScopeDocument] = useState<ScopeDocument | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([evidenceService.list(), assessmentService.list(), scopeService.list(), scopeService.getDocument()]).then(
      ([ev, obs, scp, doc]) => {
        if (cancelled) return;
        setEvidence(ev);
        setObservations(obs);
        setScope(scp);
        setScopeDocument(doc);
        setLoading(false);
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const addEvidenceFile = useCallback(async (input: AddFileInput) => {
    const created = await evidenceService.addFile(input);
    setEvidence((prev) => [created, ...prev]);
    return created;
  }, []);

  const addEvidenceNote = useCallback(async (input: AddNoteInput) => {
    const created = await evidenceService.addNote(input);
    setEvidence((prev) => [created, ...prev]);
    return created;
  }, []);

  const removeEvidence = useCallback(async (id: string) => {
    await evidenceService.remove(id);
    setEvidence((prev) => prev.filter((e) => e.id !== id));
    setObservations((prev) => prev.map((o) => ({ ...o, evidenceIds: o.evidenceIds.filter((e) => e !== id) })));
  }, []);

  const getEvidenceObjectUrl = useCallback(async (id: string) => evidenceService.getObjectUrl(id), []);

  const upsertObservation = useCallback(async (input: UpsertObservationInput) => {
    const saved = await assessmentService.upsert(input);
    setObservations((prev) => {
      const index = prev.findIndex((o) => o.id === saved.id);
      if (index >= 0) {
        const next = [...prev];
        next[index] = saved;
        return next;
      }
      return [...prev, saved];
    });
    return saved;
  }, []);

  const getObservation = useCallback(
    (frameworkId: string, controlId: string) => observations.find((o) => o.id === observationId(frameworkId, controlId)),
    [observations],
  );

  const setScopeIncluded = useCallback(async (frameworkId: string, includedControlIds: string[]) => {
    const saved = await scopeService.setIncluded(frameworkId, includedControlIds);
    setScope((prev) => {
      const index = prev.findIndex((s) => s.frameworkId === frameworkId);
      if (index >= 0) {
        const next = [...prev];
        next[index] = saved;
        return next;
      }
      return [...prev, saved];
    });
    return saved;
  }, []);

  const updateScopeDocument = useCallback(async (partial: Partial<Omit<ScopeDocument, 'id'>>) => {
    const saved = await scopeService.updateDocument(partial);
    setScopeDocument(saved);
    return saved;
  }, []);

  const setScopeDocumentAttachment = useCallback(async (file: File) => {
    const saved = await scopeService.setDocumentAttachment(file);
    setScopeDocument(saved);
    return saved;
  }, []);

  const removeScopeDocumentAttachment = useCallback(async () => {
    const saved = await scopeService.removeDocumentAttachment();
    setScopeDocument(saved);
    return saved;
  }, []);

  const getScopeDocumentAttachmentUrl = useCallback(async () => scopeService.getDocumentAttachmentUrl(), []);
  const readScopeDocumentAttachmentText = useCallback(async () => scopeService.readDocumentAttachmentText(), []);

  const value = useMemo<AppDataContextValue>(
    () => ({
      evidence,
      observations,
      scope,
      scopeDocument,
      loading,
      addEvidenceFile,
      addEvidenceNote,
      removeEvidence,
      getEvidenceObjectUrl,
      upsertObservation,
      getObservation,
      setScopeIncluded,
      updateScopeDocument,
      setScopeDocumentAttachment,
      removeScopeDocumentAttachment,
      getScopeDocumentAttachmentUrl,
      readScopeDocumentAttachmentText,
    }),
    [
      evidence,
      observations,
      scope,
      scopeDocument,
      loading,
      addEvidenceFile,
      addEvidenceNote,
      removeEvidence,
      getEvidenceObjectUrl,
      upsertObservation,
      getObservation,
      setScopeIncluded,
      updateScopeDocument,
      setScopeDocumentAttachment,
      removeScopeDocumentAttachment,
      getScopeDocumentAttachmentUrl,
      readScopeDocumentAttachmentText,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}
