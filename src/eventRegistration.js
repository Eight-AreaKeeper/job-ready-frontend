import { useState } from 'react';
import { useAuth } from './auth.jsx';

// Event registrations are kept in this browser only (there is no registration API yet).
export function useEventRegistrations() {
  const { user } = useAuth();
  const key = `jobready.events.${user?.id || 'guest'}`;
  const [ids, setIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
  });
  function register(id) {
    const next = [...new Set([...ids, id])];
    setIds(next);
    try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* private mode: keep it for this visit */ }
  }
  return { isRegistered: (id) => ids.includes(id), register };
}
