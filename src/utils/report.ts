// Pure functions that turn scored frameworks and gaps into the narrative
// pieces of the engagement report (executive summary, roadmap). No I/O,
// no external service: plain templating over data already computed by
// scoring.ts, so the numbers in the story always match the numbers in the
// charts and tables next to it.

import type { MaturityRating } from '../types';
import { MATURITY_LABELS } from '../types';
import type { FrameworkScore, GapEntry } from './scoring';
import { topGaps } from './scoring';
import { overallAverageRating } from './scoring';
import type { Framework, Observation } from '../types';

/** Merges each in-scope framework's top gaps into one worst-first list. */
export function aggregateTopGaps(frameworks: Framework[], observations: Observation[], limit = 10): GapEntry[] {
  const all = frameworks.flatMap((f) => topGaps(f, observations));
  return all
    .sort((a, b) => {
      const aRank = a.rating === null ? -1 : a.rating;
      const bRank = b.rating === null ? -1 : b.rating;
      return aRank - bRank;
    })
    .slice(0, limit);
}

export function buildExecutiveSummary(params: {
  frameworkScores: FrameworkScore[];
  gaps: GapEntry[];
  story: string;
}): string {
  const { frameworkScores, gaps, story } = params;
  const totalControls = frameworkScores.reduce((sum, f) => sum + f.totalCount, 0);
  const totalRated = frameworkScores.reduce((sum, f) => sum + f.ratedCount, 0);
  const pctRated = totalControls > 0 ? Math.round((totalRated / totalControls) * 100) : 0;
  const avg = overallAverageRating(frameworkScores);
  const frameworkList = frameworkScores.map((f) => f.shortName).join(', ');
  const worst = gaps[0];
  const focus = story.trim();

  const sentences: string[] = [
    `This assessment covered ${frameworkScores.length} framework(s) (${frameworkList}) across ${totalControls} in scope control(s), with ${totalRated} of them (${pctRated} percent) rated to date at an average maturity of ${avg.toFixed(1)} out of 3.`,
  ];
  if (focus) sentences.push(focus);
  if (worst) {
    const label = worst.rating === null ? 'unrated' : MATURITY_LABELS[worst.rating as MaturityRating];
    sentences.push(`The most significant gap is ${worst.controlCode}: ${worst.controlName} (${worst.frameworkShortName}), currently ${label}.`);
  }
  sentences.push('Addressing the recommendations below will materially improve the organization’s secure development posture.');
  return sentences.join(' ');
}

export type RoadmapPhase = 'Now (0 to 30 days)' | 'Next (31 to 90 days)' | 'Later (90+ days)';

export interface RoadmapItem {
  phase: RoadmapPhase;
  frameworkShortName: string;
  controlCode: string;
  controlName: string;
  recommendation: string;
}

/** Groups gaps into a simple three-phase remediation roadmap, worst-first within each phase. */
export function buildRoadmap(gaps: GapEntry[], limitPerPhase = 6): RoadmapItem[] {
  const perPhaseCount: Partial<Record<RoadmapPhase, number>> = {};
  const items: RoadmapItem[] = [];
  for (const gap of gaps) {
    const phase: RoadmapPhase =
      gap.rating === null || gap.rating === 0
        ? 'Now (0 to 30 days)'
        : gap.rating === 1
          ? 'Next (31 to 90 days)'
          : 'Later (90+ days)';
    const count = (perPhaseCount[phase] ?? 0) + 1;
    perPhaseCount[phase] = count;
    if (count > limitPerPhase) continue;
    items.push({
      phase,
      frameworkShortName: gap.frameworkShortName,
      controlCode: gap.controlCode,
      controlName: gap.controlName,
      recommendation: `Implement or strengthen ${gap.controlCode}: ${gap.controlName} to reach at least "Largely Implemented."`,
    });
  }
  return items;
}

export interface PeerComparisonRow {
  frameworkId: string;
  frameworkShortName: string;
  yourAverage: number;
  peerAverage: number | null;
}

export interface DetailedObservationEntry {
  code: string;
  name: string;
  ratingLabel: string;
  question: string;
  notes: string;
  evidenceTitles: string[];
}

export interface DetailedObservationGroup {
  frameworkShortName: string;
  entries: DetailedObservationEntry[];
}

/** Assembles every report section into one plain-text document, suitable for copy/paste into email, Word, or Slack. */
export function buildReportText(params: {
  title: string;
  executiveSummary: string;
  peerRows: PeerComparisonRow[];
  gaps: GapEntry[];
  roadmap: RoadmapItem[];
  detailedGroups: DetailedObservationGroup[];
}): string {
  const { title, executiveSummary, peerRows, gaps, roadmap, detailedGroups } = params;
  const lines: string[] = [];

  lines.push(title.toUpperCase(), '');
  lines.push('EXECUTIVE SUMMARY', executiveSummary, '');

  lines.push('MATURITY SCORE VS. PEER BENCHMARK');
  for (const row of peerRows) {
    const peer = row.peerAverage === null ? 'not set' : `${row.peerAverage.toFixed(1)} / 3`;
    lines.push(`${row.frameworkShortName}: ${row.yourAverage.toFixed(1)} / 3 (peer benchmark: ${peer})`);
  }
  lines.push('');

  lines.push('KEY GAPS');
  if (gaps.length === 0) {
    lines.push('No gaps. Every in scope control is rated above the threshold.');
  } else {
    for (const gap of gaps) {
      const label = gap.rating === null ? 'Unrated' : `Rated ${gap.rating} / 3`;
      lines.push(`${gap.frameworkShortName} ${gap.controlCode}: ${gap.controlName} (${label})`);
    }
  }
  lines.push('');

  lines.push('KEY RECOMMENDATIONS AND ROADMAP');
  const phases: RoadmapPhase[] = ['Now (0 to 30 days)', 'Next (31 to 90 days)', 'Later (90+ days)'];
  for (const phase of phases) {
    const inPhase = roadmap.filter((item) => item.phase === phase);
    if (inPhase.length === 0) continue;
    lines.push(phase);
    for (const item of inPhase) {
      lines.push(`  ${item.frameworkShortName} ${item.controlCode}: ${item.recommendation}`);
    }
  }
  lines.push('');

  lines.push('DETAILED OBSERVATIONS');
  for (const group of detailedGroups) {
    lines.push(`${group.frameworkShortName.toUpperCase()} FRAMEWORK`);
    for (const entry of group.entries) {
      lines.push(`${entry.code}: ${entry.name}`);
      lines.push(`Rating: ${entry.ratingLabel}`);
      lines.push(`Question asked: ${entry.question}`);
      lines.push(`Notes: ${entry.notes || 'No notes yet.'}`);
      lines.push(`Evidence: ${entry.evidenceTitles.length > 0 ? entry.evidenceTitles.join(', ') : 'No evidence linked yet.'}`);
      lines.push('');
    }
  }

  return lines.join('\n');
}
