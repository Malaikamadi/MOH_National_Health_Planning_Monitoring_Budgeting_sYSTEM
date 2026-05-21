/**
 * Thin typed wrapper over the NHPMBR API.
 *
 * In Phase 0 we will replace the hand-written types here with auto-generated
 * ones from the FastAPI OpenAPI spec (`packages/shared-types`). Until then,
 * keep the surface small and explicit.
 */

const DEFAULT_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  token?: string;
  baseUrl?: string;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { body, token, baseUrl = DEFAULT_BASE, headers, ...rest } = opts;
  const url = `${baseUrl}${path}`;

  const res = await fetch(url, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'include',
    cache: 'no-store',
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  const payload = text ? JSON.parse(text) : {};

  if (!res.ok) {
    const err = payload?.error ?? {};
    throw new ApiError(
      err.code ?? `http.${res.status}`,
      err.message ?? res.statusText,
      res.status,
      err.details,
    );
  }
  return payload as T;
}

export const api = {
  get:    <T>(path: string, opts?: RequestOptions) => request<T>(path, { ...opts, method: 'GET' }),
  post:   <T>(path: string, body: unknown, opts?: RequestOptions) =>
            request<T>(path, { ...opts, method: 'POST', body }),
  patch:  <T>(path: string, body: unknown, opts?: RequestOptions) =>
            request<T>(path, { ...opts, method: 'PATCH', body }),
  delete: <T>(path: string, opts?: RequestOptions) =>
            request<T>(path, { ...opts, method: 'DELETE' }),
};

// ---------- Minimal typed surface for the MVP ----------

export interface UserOut {
  id: string;
  email: string;
  full_name: string;
  preferred_lang: string;
  is_active: boolean;
  mfa_enrolled: boolean;
}

export interface DirectorateOut {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
}

export type AwpStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'revisions_requested'
  | 'approved'
  | 'active'
  | 'closed';

export interface AwpOut {
  id: string;
  fiscal_year_id: string;
  directorate_id: string;
  status: AwpStatus;
  submitted_at: string | null;
  approved_at: string | null;
  total_budget: string | null;
  currency_code: string;
  created_at: string;
  updated_at: string;
}
