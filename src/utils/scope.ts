// Pure helpers for narrowing a Framework down to the controls that are in
// scope for this assessment engagement. No I/O — callers pass in the
// ScopeSelection[] already loaded via AppDataContext.

import type { Framework, ScopeSelection } from '../types';

/**
 * The set of in-scope control ids for a framework, or `null` if scope has
 * never been edited for it (meaning: everything is in scope).
 */
export function includedControlIdsFor(scope: ScopeSelection[], frameworkId: string): Set<string> | null {
  const record = scope.find((s) => s.frameworkId === frameworkId);
  return record ? new Set(record.includedControlIds) : null;
}

/**
 * Returns a copy of the framework containing only in-scope controls (and only
 * the functions that still have at least one in-scope control). Pass the
 * result of `includedControlIdsFor` — `null` returns the framework unchanged.
 */
export function applyScope(framework: Framework, includedControlIds: Set<string> | null): Framework {
  if (includedControlIds === null) return framework;
  return {
    ...framework,
    functions: framework.functions
      .map((fn) => ({ ...fn, controls: fn.controls.filter((c) => includedControlIds.has(c.id)) }))
      .filter((fn) => fn.controls.length > 0),
  };
}
