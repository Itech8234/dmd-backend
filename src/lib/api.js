// Central API client — Django REST Framework is the ONLY backend.
// - VITE_API_BASE_URL: absolute API origin (production). Empty = same-origin
//   (dev Vite proxy → http://localhost:8000).
// - Auth: Django session cookie + CSRF token (no JWT, no second backend).
const BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : '';
}

export async function api(path, options = {}) {
  const opts = { credentials: 'include', headers: {}, ...options };
  if (opts.body && !(opts.body instanceof FormData)) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(opts.body);
  }
  // Django session auth requires the CSRF token on unsafe methods.
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes((opts.method || 'GET').toUpperCase())) {
    if (!getCookie('csrftoken')) {
      try { await fetch(`${BASE}/auth/csrf`, { credentials: 'include' }); } catch (e) { /* offline */ }
    }
    const csrf = getCookie('csrftoken');
    if (csrf) opts.headers['X-CSRFToken'] = csrf;
  }
  let res;
  try {
    res = await fetch(`${BASE}${path}`, opts);
  } catch (e) {
    const err = new Error('Network unavailable. Please check your connection and try again.');
    err.status = 0;
    throw err;
  }
  let data = null;
  try { data = await res.json(); } catch (e) { data = null; }
  if (!res.ok) {
    const detail =
      (data && (data.error || data.detail)) ||
      (data && typeof data === 'object' && Object.values(data).flat().join(' ')) ||
      `Request failed (${res.status})`;
    const err = new Error(detail);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const fmtDate = (iso, lang = 'en') =>
  iso ? new Date(iso).toLocaleDateString(lang === 'ha' ? 'ha-NG' : 'en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  }) : '';

export const fmtDateTime = (iso, lang = 'en') =>
  iso ? new Date(iso).toLocaleString(lang === 'ha' ? 'ha-NG' : 'en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }) : '';

export default api;

