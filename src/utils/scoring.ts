// Pure scoring functions shared by the Dashboard and Reports pages.
// No I/O here — callers pass in frameworks + observations already loaded via
// AppDataContext.

import type { Framework, FrameworkFunction, Observation } from '../types';
import { observationId } from '../types';

export interface FunctionScore {
  functionId: string;
  code: string;
  name: string;
  ratedCount: number;
  totalCount: number;
  averageRating: number; // 0-3, average over rated controls only (0 if none rated)
}

export interface FrameworkScore {
  frameworkId: string;
  shortName: string;
  ratedCount: number;
  totalCount: number;
  averageRating: number; // 0-3
  functionScores: FunctionScore[];
}

function observationFor(
  observations: Observation[],
  frameworkId: string,
  controlId: string,
): Observation | undefined {
  const id = observationId(frameworkId, controlId);
  return observations.find((o) => o.id === id);
}

export function scoreFunction(
  frameworkId: string,
  fn: FrameworkFunction,
  observations: Observation[],
): FunctionScore {
  const ratings: number[] = [];
  for (const control of fn.controls) {
    const obs = observationFor(observations, frameworkId, control.id);
    if (obs && obs.rating !== null) ratings.push(obs.rating);
  }
  const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
  return {
    functionId: fn.id,
    code: fn.code,
    name: fn.name,
    ratedCount: ratings.length,
    totalCount: fn.controls.length,
    averageRating,
  };
}

export function scoreFramework(framework: Framework, observations: Observation[]): FrameworkScore {
  const functionScores = framework.functions.map((fn) => scoreFunction(framework.id, fn, observations));
  const totalCount = functionScores.reduce((sum, fs) => sum + fs.totalCount, 0);
  const ratedCount = functionScores.reduce((sum, fs) => sum + fs.ratedCount, 0);
  const allRatings: number[] = [];
  for (const fn of framework.functions) {
    for (const control of fn.controls) {
      const obs = observationFor(observations, framework.id, control.id);
      if (obs && obs.rating !== null) allRatings.push(obs.rating);
    }
  }
  const averageRating = allRatings.length > 0 ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length : 0;
  return {
    frameworkId: framework.id,
    shortName: framework.shortName,
    ratedCount,
    totalCount,
    averageRating,
    functionScores,
  };
}

/** Overall weighted average maturity across all frameworks, weighted by rated control count. */
export function overallAverageRating(frameworkScores: FrameworkScore[]): number {
  const totalRated = frameworkScores.reduce((sum, fs) => sum + fs.ratedCount, 0);
  if (totalRated === 0) return 0;
  const weightedSum = frameworkScores.reduce((sum, fs) => sum + fs.averageRating * fs.ratedCount, 0);
  return weightedSum / totalRated;
}

export interface GapEntry {
  frameworkId: string;
  frameworkShortName: string;
  functionCode: string;
  controlId: string;
  controlCode: string;
  controlName: string;
  rating: number | null; // null = unrated, treated as worst
}

/** Controls that are unrated or rated <= 1, worst (unrated, then lowest rating) first. */
export function topGaps(framework: Framework, observations: Observation[]): GapEntry[] {
  const gaps: GapEntry[] = [];
  for (const fn of framework.functions) {
    for (const control of fn.controls) {
      const obs = observationFor(observations, framework.id, control.id);
      const rating = obs?.rating ?? null;
      if (rating === null || rating <= 1) {
        gaps.push({
          frameworkId: framework.id,
          frameworkShortName: framework.shortName,
          functionCode: fn.code,
          controlId: control.id,
          controlCode: control.code,
          controlName: control.name,
          rating,
        });
      }
    }
  }
  return gaps.sort((a, b) => {
    const aRank = a.rating === null ? -1 : a.rating;
    const bRank = b.rating === null ? -1 : b.rating;
    return aRank - bRank;
  });
}
