import { useState } from 'react';
import { useAuth } from './auth.jsx';

// Event registrations are kept in this browser only (there is no registration API yet).
export function useEventRegistrations() {
  const { user } = useAuth();
  const key = `jobready.events.${user?.id || 'guest'}`;
  const [ids, setIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
  });
  function save(next) {
    setIds(next);
    try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* private mode: keep it for this visit */ }
  }
  /** Register, or cancel when already registered. */
  function toggle(id) {
    save(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);
  }
  return { isRegistered: (id) => ids.includes(id), toggle };
}
