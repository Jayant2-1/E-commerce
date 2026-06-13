const TOKEN_KEY = 'ecommerce_user_tokens';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '';

export function getStoredTokens() {
  try {
    return JSON.parse(localStorage.getItem(TOKEN_KEY)) || {};
  } catch {
    return {};
  }
}

export function storeTokens(tokens) {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens || {}));
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
}

function buildUrl(path, query = {}) {
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin);
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
}

export async function apiRequest({ path, method = 'GET', query, body, headers, auth = true }) {
  const tokens = getStoredTokens();
  const requestHeaders = {
    Accept: 'application/json',
    ...(headers || {}),
  };

  if (body !== undefined && body !== null) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (auth && tokens.accessToken) {
    requestHeaders.Authorization = `Bearer ${tokens.accessToken}`;
  }

  const response = await fetch(buildUrl(path, query), {
    method,
    headers: requestHeaders,
    body: body === undefined || body === null ? undefined : JSON.stringify(body),
  });

  const text = await response.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error ||
      (typeof payload === 'string' ? payload : `Request failed with ${response.status}`);
    throw new Error(`${response.status} ${response.statusText}: ${message}`);
  }

  return payload;
}

export function unwrapData(response) {
  return response && Object.prototype.hasOwnProperty.call(response, 'data')
    ? response.data
    : response;
}
