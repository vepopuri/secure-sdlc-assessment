// Thin fetch wrapper shared by every service that talks to the backend.
// No fetch library — plain `fetch` plus this is enough, matching the
// project's existing minimalism.

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function isPermissionError(err: unknown): boolean {
  return err instanceof ApiError && err.status === 403;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    credentials: 'include',
    headers: { 'content-type': 'application/json', ...init?.headers },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string; code?: string };
    throw new ApiError(res.status, body.error ?? `Request failed (${res.status})`, body.code);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
