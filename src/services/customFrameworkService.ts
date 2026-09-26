// Custom framework service: the only module that reads/writes the engagement's
// own custom control catalog (localStorage). Pages must go through
// AppDataContext — never through storage/* directly. These controls behave
// exactly like any built-in framework's once created (rating, evidence,
// reporting), via utils/customFramework.ts's synthetic Framework wrapper.

import type { Control } from '../types';
import { listItems, upsertItem, removeItem } from '../storage/localStore';

const COLLECTION_KEY = 'customControls';

function newId(): string {
  return `custom-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function list(): Promise<Control[]> {
  return listItems<Control>(COLLECTION_KEY);
}

export interface AddCustomControlInput {
  code: string;
  name: string;
  description: string;
  question: string;
  sampleAnswer: string;
  guidance?: string;
}

export async function add(input: AddCustomControlInput): Promise<Control> {
  const control: Control = { id: newId(), ...input };
  upsertItem(COLLECTION_KEY, control);
  return control;
}

export async function remove(id: string): Promise<void> {
  removeItem<Control>(COLLECTION_KEY, id);
}
