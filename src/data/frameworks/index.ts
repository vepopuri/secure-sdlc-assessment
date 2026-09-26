import type { Framework } from '../../types';
import { sammFramework } from './samm';
import { nistCsfFramework } from './nistCsf';
import { ssdfFramework } from './ssdf';

/**
 * Registry of all supported frameworks. To add another framework:
 * 1. Create `src/data/frameworks/<name>.ts` exporting a `Framework` object.
 * 2. Add it to this array.
 * That's it — every page (Dashboard, Assessment, Reports) reads from this registry.
 */
export const frameworks: Framework[] = [sammFramework, nistCsfFramework, ssdfFramework];

export function getFramework(frameworkId: string): Framework | undefined {
  return frameworks.find((f) => f.id === frameworkId);
}

export function getControl(
  frameworkId: string,
  controlId: string,
): { control: Framework['functions'][number]['controls'][number]; fn: Framework['functions'][number] } | undefined {
  const framework = getFramework(frameworkId);
  if (!framework) return undefined;
  for (const fn of framework.functions) {
    const control = fn.controls.find((c) => c.id === controlId);
    if (control) return { control, fn };
  }
  return undefined;
}

export function allControlIds(framework: Framework): string[] {
  return framework.functions.flatMap((fn) => fn.controls.map((c) => c.id));
}
