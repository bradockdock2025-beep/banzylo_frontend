import { API_BASE_URL } from "./config";

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

interface ApiFetchOptions extends Omit<RequestInit, "cache"> {
  /** Next.js ISR window in seconds, or false to opt out of the Data Cache entirely (e.g. mutations). */
  revalidate?: number | false;
}

// The only place in the codebase that calls fetch() directly for backend
// requests — every src/lib/api/*.ts service goes through this, so the HTTP
// concerns (base URL, timeouts, error shape) only ever need to change here.
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { revalidate, headers, ...init } = options;
  const url = `${API_BASE_URL}${path}`;

  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: { "Content-Type": "application/json", ...headers },
      next: revalidate === false ? undefined : { revalidate: revalidate ?? 60 },
    });
  } catch (err) {
    throw new ApiError(
      `Network error reaching ${url}: ${err instanceof Error ? err.message : String(err)}`,
      0
    );
  }

  if (!res.ok) {
    let code: string | undefined;
    let message = `Request to ${path} failed with status ${res.status}`;
    try {
      const body = await res.json();
      if (typeof body?.code === "string") code = body.code;
      if (typeof body?.message === "string") message = body.message;
    } catch {
      // Error body wasn't JSON — keep the generic message above.
    }
    throw new ApiError(message, res.status, code);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
