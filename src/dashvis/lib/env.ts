/**
 * Env vars must be prefixed with VITE_ to be exposed to the client.
 * Add real URLs when you connect to WebApp-Vis / APIs.
 */
export function getApiBaseUrl(): string {
  const base = import.meta.env.VITE_API_BASE_URL
  return typeof base === 'string' ? base.replace(/\/$/, '') : ''
}
