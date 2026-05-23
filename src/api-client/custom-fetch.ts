export type AuthTokenGetter = () => Promise<string | null> | string | null;
let baseUrl = "";
let authTokenGetter: AuthTokenGetter | null = null;
export function setBaseUrl(url: string) { baseUrl = url.replace(/\/$/, ""); }
export function setAuthTokenGetter(getter: AuthTokenGetter) { authTokenGetter = getter; }
export type ErrorType<T> = T & { status?: number };
export type BodyType<T> = T;
export async function customFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;
  const headers: Record<string, string> = { "Content-Type": "application/json", ...(options.headers as Record<string, string>) };
  if (authTokenGetter) { const token = await authTokenGetter(); if (token) headers["Authorization"] = `Bearer ${token}`; }
  const response = await fetch(fullUrl, { ...options, headers });
  if (!response.ok) {
    let body: unknown;
    try { body = await response.json(); } catch { body = { error: response.statusText }; }
    const err = new Error(typeof body === "object" && body !== null && "error" in body ? String((body as any).error) : `HTTP ${response.status}`) as ErrorType<Error>;
    (err as any).status = response.status;
    Object.assign(err, body);
    throw err;
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
