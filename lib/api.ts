'use client';

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('lms_token');
}

export interface ApiError extends Error {
  status: number;
  reasons?: string[];
}

async function handle(res: Response) {
  const isJson = res.headers
    .get('content-type')
    ?.includes('application/json');
  const body = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const err = new Error(
      (typeof body === 'object' && body?.message) ||
        `Request failed with ${res.status}`
    ) as ApiError;
    err.status = res.status;
    if (typeof body === 'object' && body?.reasons)
      err.reasons = body.reasons;
    throw err;
  }
  return body;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: authHeaders(),
    cache: 'no-store',
  });
  return handle(res);
}

export async function apiPost<T>(path: string, body?: any): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: body ? JSON.stringify(body) : undefined,
  });
  return handle(res);
}

export async function apiPut<T>(path: string, body?: any): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: body ? JSON.stringify(body) : undefined,
  });
  return handle(res);
}

export async function apiUpload<T>(
  path: string,
  file: File,
  field = 'file'
): Promise<T> {
  const form = new FormData();
  form.append(field, file);
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: authHeaders(),
    body: form,
  });
  return handle(res);
}

function authHeaders(): Record<string, string> {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}
