// Shared browser API helper used by pages and components to call the Express backend.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function getHeaders(includeAuth = true): HeadersInit {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (includeAuth) {
    const token = localStorage.getItem('garnish_token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  return headers;
}

// Centralize fetch defaults so pages only pass route-specific details.
// Build the final request URL, attach the auth token when needed, and parse the JSON response.
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const providedHeaders = new Headers(options.headers || {});
  const hasAuthHeader = providedHeaders.has('Authorization');

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...getHeaders(!hasAuthHeader),
      ...Object.fromEntries(providedHeaders.entries())
    }
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    let message = 'Request failed';
    if ((data as { message?: string } | null)?.message) {
      message = (data as { message?: string }).message as string;
    }
    throw new Error(message);
  }

  return data as T;
}
