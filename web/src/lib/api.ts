const API_URL = import.meta.env.VITE_API_URL || '';

function getStoredToken() {
  const token = localStorage.getItem('garnish_token');
  if (token) {
    return token;
  }

  return '';
}

function getDefaultHeaders(includeJson: boolean) {
  const headers: Record<string, string> = {};

  if (includeJson) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getStoredToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const requestHeaders = new Headers(options.headers || {});
  const hasContentType = requestHeaders.has('Content-Type');
  const hasAuthorization = requestHeaders.has('Authorization');

  const includeJson = !hasContentType && typeof options.body === 'string';
  const defaultHeaders = getDefaultHeaders(includeJson);

  if (hasAuthorization) {
    delete defaultHeaders.Authorization;
  }

  const mergedHeaders = new Headers(defaultHeaders);

  requestHeaders.forEach((value, key) => {
    mergedHeaders.set(key, value);
  });

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: mergedHeaders
  });

  let data: any = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || 'Request failed');
  }

  return data as T;
}