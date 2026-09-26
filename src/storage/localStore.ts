// Minimal localStorage-backed JSON collection helper. Metadata for evidence and
// observations lives here; file bytes live in IndexedDB (see idb.ts).

function readCollection<T>(key: string): T[] {
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function writeCollection<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items));
}

export function listItems<T>(key: string): T[] {
  return readCollection<T>(key);
}

export function getItem<T extends { id: string }>(key: string, id: string): T | undefined {
  return readCollection<T>(key).find((item) => item.id === id);
}

export function upsertItem<T extends { id: string }>(key: string, item: T): void {
  const items = readCollection<T>(key);
  const index = items.findIndex((existing) => existing.id === item.id);
  if (index >= 0) {
    items[index] = item;
  } else {
    items.push(item);
  }
  writeCollection(key, items);
}

export function removeItem<T extends { id: string }>(key: string, id: string): void {
  const items = readCollection<T>(key).filter((item) => item.id !== id);
  writeCollection(key, items);
}
