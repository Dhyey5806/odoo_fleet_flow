/**
 * API client for FleetFlow backend.
 * Sends JWT in Authorization header for authenticated routes.
 */

import { useAuthStore } from '../store/authStore'

const API_BASE = 'http://localhost:5000';

function getToken(): string | null {
  return useAuthStore.getState().token ?? null;
}

async function request<T = unknown>(
  path: string,
  options: RequestInit & { method?: string; body?: object } = {}
): Promise<T> {
  const { method = 'GET', body, headers: customHeaders, ...rest } = options;
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const res = await fetch(url, {
    method,
    headers,
    ...(body !== undefined && { body: JSON.stringify(body) }),
    ...rest,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) {
      useAuthStore.getState().logout();
    }
    throw new Error(data.message || `Request failed: ${res.status}`);
  }
  return data as T;
}

export const api = {
  get: <T = unknown>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T = unknown>(path: string, body: object) => request<T>(path, { method: 'POST', body }),
  patch: <T = unknown>(path: string, body: object) => request<T>(path, { method: 'PATCH', body }),
};

export default api;
