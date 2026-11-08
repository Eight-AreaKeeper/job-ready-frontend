// Display helpers. All times from the API are ISO 8601 (UTC); show them in the viewer's time zone.

const LOCALE = 'en-CA';

export function fmtDate(iso, opts = { month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!iso) return '';
  const d = new Date(iso.length === 10 ? iso + 'T12:00:00' : iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString(LOCALE, opts);
}

export function fmtDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(LOCALE, { weekday: 'short', month: 'short', day: 'numeric' }) + ' · ' +
    d.toLocaleTimeString(LOCALE, { hour: 'numeric', minute: '2-digit' });
}

export function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString(LOCALE, { hour: 'numeric', minute: '2-digit' });
}

/** Whole days from today until a YYYY-MM-DD deadline (negative when past). */
export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const end = new Date(dateStr + 'T23:59:59');
  return Math.ceil((end.getTime() - Date.now()) / 86400000);
}

export const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

export function initials(name) {
  return (name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

export const KIND_LABELS = { career_fair: 'Career fair', workshop: 'Workshop', networking: 'Networking', info_session: 'Info session' };
export const DAY_NAMES = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' };
export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const INDUSTRIES = ['Software', 'Energy', 'Health', 'Finance', 'Engineering', 'Research', 'Government', 'Education'];

/** "Tue and Thu, 18:00–19:00" style summary of mentor availability slots. */
export function fmtAvailability(slots) {
  if (!slots || !slots.length) return 'Not set yet';
  return slots.map((s) => `${s.day} ${s.start}–${s.end}`).join(', ');
}

/** Next concrete times for weekly slots, as ISO strings with the viewer's offset. */
export function upcomingSlotTimes(slots, count = 4) {
  const out = [];
  const now = new Date();
  for (let add = 1; add <= 21 && out.length < count * 3; add++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + add);
    const dayKey = DAYS[(d.getDay() + 6) % 7];
    for (const s of slots || []) {
      if (s.day !== dayKey) continue;
      const [h, m] = (s.start || '18:00').split(':').map(Number);
      const t = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m);
      out.push(toOffsetIso(t));
    }
  }
  return out.slice(0, count);
}

export function toOffsetIso(d) {
  const pad = (n) => String(Math.abs(n)).padStart(2, '0');
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? '+' : '-';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00` +
    `${sign}${pad(Math.trunc(off / 60))}:${pad(off % 60)}`;
}

/** Where a signed-in user lands: mentors on their dashboard, students on recommendations. */
export function homeFor(user) {
  if (!user) return '/';
  return user.role === 'mentor' ? '/mentor/dashboard' : '/opportunities/recommended';
}
