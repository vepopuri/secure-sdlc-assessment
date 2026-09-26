// Data shaping for the richer PPTX report sections: framework overview grid,
// per-function strengths/opportunities, radar-chart series, and the
// appendix's documentation/interview registers. Every value here is either
// pulled straight from real assessment data or, for the appendix, from the
// Evidence Library — nothing here is invented.

import type { Evidence, Framework, MaturityRating, Observation } from '../types';
import { observationId } from '../types';
import type { FunctionScore } from './scoring';
import { computeEvidenceSerials, formatSerial } from './evidenceSerial';

export interface FrameworkOverviewColumn {
  functionName: string;
  controlNames: string[];
}

/** One column per function, listing its controls by name — the "assessment framework" grid. */
export function buildFrameworkOverview(framework: Framework): FrameworkOverviewColumn[] {
  return framework.functions.map((fn) => ({
    functionName: fn.name,
    controlNames: fn.controls.map((c) => c.name),
  }));
}

export interface FunctionObservationItem {
  code: string;
  name: string;
  rating: MaturityRating | null;
  notes: string;
}

export interface FunctionObservations {
  functionName: string;
  strengths: FunctionObservationItem[];
  opportunities: FunctionObservationItem[];
}

/** Splits each function's controls into strengths (rating >= 2) and opportunities (unrated or rating <= 1). */
export function buildFunctionObservations(framework: Framework, observations: Observation[]): FunctionObservations[] {
  return framework.functions.map((fn) => {
    const strengths: FunctionObservationItem[] = [];
    const opportunities: FunctionObservationItem[] = [];
    for (const control of fn.controls) {
      const obs = observations.find((o) => o.id === observationId(framework.id, control.id));
      const item: FunctionObservationItem = { code: control.code, name: control.name, rating: obs?.rating ?? null, notes: obs?.notes ?? '' };
      if (item.rating !== null && item.rating >= 2) strengths.push(item);
      else opportunities.push(item);
    }
    return { functionName: fn.name, strengths, opportunities };
  });
}

export interface RadarData {
  categories: string[];
  values: number[];
}

/** Average maturity per function, for a radar chart — only meaningful with at least 3 functions. */
export function buildRadarData(functionScores: FunctionScore[]): RadarData | null {
  if (functionScores.length < 3) return null;
  return {
    categories: functionScores.map((fs) => fs.name),
    values: functionScores.map((fs) => Number(fs.averageRating.toFixed(2))),
  };
}

export interface AppendixRow {
  ref: string;
  title: string;
  date?: string;
}

/** Documentation reviewed: every uploaded document/image/other evidence item, oldest first, by its stable REF number. */
export function buildDocumentationReviewed(evidence: Evidence[]): AppendixRow[] {
  const serials = computeEvidenceSerials(evidence);
  return evidence
    .filter((e) => e.kind === 'document' || e.kind === 'image' || e.kind === 'other')
    .sort((a, b) => (serials.get(a.id) ?? 0) - (serials.get(b.id) ?? 0))
    .map((e) => ({ ref: formatSerial(serials.get(e.id) ?? 0), title: e.title }));
}

/** Interviews conducted: every meeting-note evidence item, oldest first. */
export function buildInterviewsReviewed(evidence: Evidence[]): AppendixRow[] {
  const serials = computeEvidenceSerials(evidence);
  return evidence
    .filter((e) => e.kind === 'interview-note')
    .sort((a, b) => (serials.get(a.id) ?? 0) - (serials.get(b.id) ?? 0))
    .map((e) => ({ ref: formatSerial(serials.get(e.id) ?? 0), title: e.title, date: new Date(e.addedAt).toLocaleDateString() }));
}
