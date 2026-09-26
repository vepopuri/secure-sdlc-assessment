// The single provider every page mounts under to read/write persisted data.
// It wraps evidenceService/assessmentService — pages never import those
// services (or storage/*) directly. When a real backend replaces the
// service internals, this file and the pages below it stay unchanged.

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Control, Evidence, Observation, ScopeDocument, ScopeSelection } from '../types';
import * as evidenceService from '../services/evidenceService';
import * as assessmentService from '../services/assessmentService';
import * as scopeService from '../services/scopeService';
import * as customFrameworkService from '../services/customFrameworkService';
import type { AddFileInput, AddNoteInput } from '../services/evidenceService';
import type { UpsertObservationInput } from '../services/assessmentService';
import type { AddCustomControlInput } from '../services/customFrameworkService';
import { observationId } from '../types';
import { AppDataContext, type AppDataContextValue } from './appDataContextDefinition';

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [scope, setScope] = useState<ScopeSelection[]>([]);
  const [scopeDocument, setScopeDocument] = useState<ScopeDocument | undefined>(undefined);
  const [customControls, setCustomControls] = useState<Control[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      evidenceService.list(),
      assessmentService.list(),
      scopeService.list(),
      scopeService.getDocument(),
      customFrameworkService.list(),
    ]).then(([ev, obs, scp, doc, customCtrls]) => {
      if (cancelled) return;
      setEvidence(ev);
      setObservations(obs);
      setScope(scp);
      setScopeDocument(doc);
      setCustomControls(customCtrls);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const addCustomControl = useCallback(async (input: AddCustomControlInput) => {
    const created = await customFrameworkService.add(input);
    setCustomControls((prev) => [...prev, created]);
    return created;
  }, []);

  const removeCustomControl = useCallback(async (id: string) => {
    await customFrameworkService.remove(id);
    setCustomControls((prev) => prev.filter((c) => c.id !== id));
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

  const addEvidenceGeneralNote = useCallback(async (input: AddNoteInput) => {
    const created = await evidenceService.addGeneralNote(input);
    setEvidence((prev) => [created, ...prev]);
    return created;
  }, []);

  const removeEvidence = useCallback(async (id: string) => {
    await evidenceService.remove(id);
    setEvidence((prev) => prev.filter((e) => e.id !== id));
    setObservations((prev) => {
      const affected = prev.filter((o) => o.evidenceLinks.some((link) => link.evidenceId === id));
      for (const o of affected) {
        assessmentService.upsert({
          frameworkId: o.frameworkId,
          controlId: o.controlId,
          evidenceLinks: o.evidenceLinks.filter((link) => link.evidenceId !== id),
        });
      }
      return prev.map((o) =>
        o.evidenceLinks.some((link) => link.evidenceId === id)
          ? { ...o, evidenceLinks: o.evidenceLinks.filter((link) => link.evidenceId !== id) }
          : o,
      );
    });
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
      customControls,
      loading,
      addEvidenceFile,
      addEvidenceNote,
      addEvidenceGeneralNote,
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
      addCustomControl,
      removeCustomControl,
    }),
    [
      evidence,
      observations,
      scope,
      scopeDocument,
      customControls,
      loading,
      addEvidenceFile,
      addEvidenceNote,
      addEvidenceGeneralNote,
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
      addCustomControl,
      removeCustomControl,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}
