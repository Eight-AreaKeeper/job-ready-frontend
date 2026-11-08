// Thin client for the job_ready back end (API docs v0.5).
// Every response is { code, msg, data }: code 1 = success, 0 = failure with msg as the reason.

const BASE = '/api/v1';
const TOKEN_KEY = 'jobready.token';

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}
export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch { /* storage blocked: stay logged in for this tab only */ }
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

let onUnauthorized = () => {};
export function setUnauthorizedHandler(fn) { onUnauthorized = fn; }

async function request(method, path, { body, query, raw } = {}) {
  let url = BASE + path;
  if (query) {
    const qs = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') qs.set(k, v); });
    const s = qs.toString();
    if (s) url += '?' + s;
  }
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = 'Bearer ' + token;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  let res;
  try {
    res = await fetch(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new ApiError('Cannot reach the server. Is the back end running?', 0);
  }
  if (raw && res.ok) return res;
  let json = null;
  try { json = await res.json(); } catch { /* not JSON */ }
  if (res.status === 401) onUnauthorized();
  if (!res.ok || !json || json.code !== 1) {
    const msg = (json && json.msg) || `Request failed (${res.status})`;
    throw new ApiError(msg, res.status);
  }
  return json.data;
}

export const api = {
  register: (b) => request('POST', '/auth/register', { body: b }),
  login: (b) => request('POST', '/auth/login', { body: b }),
  me: () => request('GET', '/users/me'),

  profileQuestions: () => request('GET', '/profile/questions'),
  submitProfile: (b) => request('POST', '/profile', { body: b }),
  getProfile: () => request('GET', '/profile'),
  updateProfile: (b) => request('PATCH', '/profile', { body: b }),

  opportunities: (q) => request('GET', '/opportunities', { query: q }),
  matches: (q) => request('GET', '/opportunities/matches', { query: q }),
  opportunity: (id) => request('GET', `/opportunities/${encodeURIComponent(id)}`),

  events: (q) => request('GET', '/events', { query: q }),
  event: (id) => request('GET', `/events/${id}`),

  resumes: () => request('GET', '/resumes'),
  resume: (id) => request('GET', `/resumes/${encodeURIComponent(id)}`),
  generateResume: () => request('POST', '/resumes/generate'),
  tailorResume: (b) => request('POST', '/resumes/tailor', { body: b }),
  suggestions: (id, b) => request('POST', `/resumes/${encodeURIComponent(id)}/suggestions`, { body: b || {} }),
  resumePdf: (id) => request('GET', `/resumes/${encodeURIComponent(id)}/pdf`, { raw: true }),

  mentors: (q) => request('GET', '/mentors', { query: q }),
  mentorSignUp: (b) => request('POST', '/mentors', { body: b }),

  icebreaker: (mentorId) => request('POST', '/coffee-chats/icebreaker', { body: { mentorId } }),
  requestChat: (b) => request('POST', '/coffee-chats', { body: b }),
  chats: () => request('GET', '/coffee-chats'),
  updateChat: (id, b) => request('PATCH', `/coffee-chats/${encodeURIComponent(id)}`, { body: b }),

  startInterview: (b) => request('POST', '/interviews', { body: b }),
  answerInterview: (id, b) => request('POST', `/interviews/${encodeURIComponent(id)}/answers`, { body: b }),
};

/** Downloads a resume PDF (the endpoint needs the token, so a plain link would not work). */
export async function downloadResumePdf(id, filename) {
  const res = await api.resumePdf(id);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `resume-${id}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
