/**
 * Thin fetch wrapper around the Microwork Django backend.
 *
 * - Reads the JWT from localStorage on every call and adds Authorization: Bearer …
 * - Normalises the backend's error envelope `{"error": {"code","message","details"}}` into a thrown `ApiError`.
 * - Sends cookies too (SameSite=Lax in dev), in case the backend ever moves to session auth.
 * - JSON-only, with a 12s timeout to avoid a hung UI.
 */

const DEFAULT_BASE_URL = 'http://127.0.0.1:8000/api/v1';

const STORAGE_KEYS = {
  baseUrl: 'microinf_api_base',
  token: 'microinf_token',
} as const;

export const getBaseUrl = (): string => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.baseUrl);
    if (stored) return stored;
  } catch {}
  return DEFAULT_BASE_URL;
};

export const setBaseUrl = (url: string) => {
  try {
    localStorage.setItem(STORAGE_KEYS.baseUrl, url);
  } catch {}
};

export const getToken = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.token);
  } catch {
    return null;
  }
};

export const setToken = (token: string | null) => {
  try {
    if (token) localStorage.setItem(STORAGE_KEYS.token, token);
    else localStorage.removeItem(STORAGE_KEYS.token);
  } catch {}
};

export class ApiError extends Error {
  status: number;
  code: string;
  details: unknown;
  constructor(opts: {
    status: number;
    code: string;
    message: string;
    details?: unknown;
  }) {
    super(opts.message);
    this.name = 'ApiError';
    this.status = opts.status;
    this.code = opts.code;
    this.details = opts.details;
  }
}

type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

type RequestOpts = {
  method?: Method;
  body?: unknown;
  /** Form data: pass an object that should be JSON-encoded, or a FormData instance. */
  formData?: FormData;
  /** Skip the Authorization header (e.g. for /auth/login). */
  anonymous?: boolean;
  /** AbortController signal. */
  signal?: AbortSignal;
  /** Query string params, will be URL-encoded. */
  query?: Record<string, string | number | boolean | undefined | null>;
};

const buildUrl = (path: string, base: string, query?: RequestOpts['query']) => {
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const url = new URL(cleanPath, normalizedBase);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === '') continue;
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
};

export async function request<T = unknown>(path: string, opts: RequestOpts = {}): Promise<T> {
  const base = getBaseUrl();
  const url = buildUrl(path, base, opts.query);
  const token = getToken();

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  let body: BodyInit | undefined;

  if (opts.formData) {
    body = opts.formData as unknown as BodyInit;
  } else if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(opts.body);
  }

  if (!opts.anonymous && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 12_000);
  const signal = opts.signal ?? controller.signal;
  // If caller supplied their own signal, cancel our timer when theirs fires.
  const onCallerAbort = () => controller.abort();
  opts.signal?.addEventListener('abort', onCallerAbort);

  let res: Response;
  try {
    res = await fetch(url, {
      method: opts.method ?? (opts.body || opts.formData ? 'POST' : 'GET'),
      headers,
      body,
      credentials: 'same-origin',
      signal,
    });
  } catch (err) {
    window.clearTimeout(timeoutId);
    if ((err as DOMException)?.name === 'AbortError') {
      throw new ApiError({
        status: 0,
        code: 'aborted',
        message: 'Request was cancelled or timed out.',
      });
    }
    throw new ApiError({
      status: 0,
      code: 'network',
      message: 'Network error — could not reach the server. Is the backend running?',
      details: err,
    });
  } finally {
    window.clearTimeout(timeoutId);
    opts.signal?.removeEventListener('abort', onCallerAbort);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  // Try to parse JSON. Some 204s report no body, others return a payload; tolerate both.
  let payload: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { raw: text };
    }
  }

  if (!res.ok) {
    const err = normaliseError(res, payload);
    throw err;
  }

  return payload as T;
}

function normaliseError(res: Response, payload: unknown): ApiError {
  // Backend envelope: { error: { code, message, details? } }
  if (
    payload &&
    typeof payload === 'object' &&
    'error' in (payload as Record<string, unknown>)
  ) {
    const env = (payload as { error: { code?: string; message?: string; details?: unknown } })
      .error;
    return new ApiError({
      status: res.status,
      code: env?.code ?? `http_${res.status}`,
      message: env?.message ?? res.statusText,
      details: env?.details,
    });
  }
  // DRF default {"detail": "..."} or {"field": ["..."]} validators
  if (payload && typeof payload === 'object') {
    const p = payload as Record<string, unknown>;
    if (typeof p.detail === 'string') {
      return new ApiError({ status: res.status, code: `http_${res.status}`, message: p.detail });
    }
    // Field errors — flatten the first message per field.
    const parts: string[] = [];
    for (const [k, v] of Object.entries(p)) {
      if (Array.isArray(v) && v.length) parts.push(`${k}: ${v[0]}`);
      else if (typeof v === 'string') parts.push(`${k}: ${v}`);
    }
    return new ApiError({
      status: res.status,
      code: `http_${res.status}`,
      message: parts.length ? parts.join(' · ') : res.statusText,
      details: payload,
    });
  }
  return new ApiError({
    status: res.status,
    code: `http_${res.status}`,
    message: res.statusText || 'Request failed',
  });
}

/** Shortcut to inspect if a thrown value is an ApiError. */
export const isApiError = (e: unknown): e is ApiError => e instanceof ApiError;
