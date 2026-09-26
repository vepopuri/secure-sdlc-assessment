// Wraps the engagement's custom controls in the same Framework shape every
// built-in framework uses, so Assessment, Reports, and scoring all treat a
// custom control exactly like a SAMM/CSF/SSDF one — no special-casing needed
// anywhere except where the framework list itself is assembled.

import type { Control, Framework } from '../types';

export const CUSTOM_FRAMEWORK_ID = 'custom';

export function buildCustomFramework(controls: Control[]): Framework {
  return {
    id: CUSTOM_FRAMEWORK_ID,
    name: 'Custom Framework',
    shortName: 'Custom',
    version: 'v1',
    description: 'Controls combined from other frameworks or authored specifically for this engagement.',
    reference: '',
    functions: [
      {
        id: 'custom-controls',
        code: 'CUSTOM',
        name: 'Custom Controls',
        description: 'Controls selected from other catalogs or written by hand for this engagement.',
        controls,
      },
    ],
  };
}
