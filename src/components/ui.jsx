import { useEffect, useState } from 'react';
import { initials } from '../format.js';

export const Sparkle = ({ size = 22, stroke = '#8B3DFF', width = 1.5 }) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={width}>
    <path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z" />
  </svg>
);

export const ArrowOut = ({ size = 14 }) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M7 17L17 7M9 7h8v8" />
  </svg>
);

export const SearchIcon = () => (
  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1d1b26" strokeWidth="2.2">
    <circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" />
  </svg>
);

export function Loading({ children = 'Loading…' }) {
  return <div className="loading" role="status"><span className="spinner" />{children}</div>;
}

export function ErrorBox({ error }) {
  if (!error) return null;
  return <p className="alert" role="alert">{typeof error === 'string' ? error : error.message}</p>;
}

export function Avatar({ name, photo, size = 36 }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [photo]);
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.36 }} aria-hidden="true">
      {photo && !broken ? <img src={photo} alt="" onError={() => setBroken(true)} /> : initials(name)}
    </span>
  );
}

export function Chip({ on, onClick, children, disabled }) {
  return <button type="button" className="chip" aria-pressed={!!on} onClick={onClick} disabled={disabled}>{children}</button>;
}

/** Loads data with an async function; re-runs when deps change. */
export function useLoad(fn, deps) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    fn().then(
      (data) => alive && setState({ data, error: null, loading: false }),
      (error) => alive && setState({ data: null, error, loading: false })
    );
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  return { ...state, reload: () => setTick((t) => t + 1), setData: (data) => setState((s) => ({ ...s, data })) };
}

export function MatchRing({ score }) {
  const n = Math.round((score || 0) * 100);
  const bg = `radial-gradient(closest-side, #ffffff 76%, transparent 78%), conic-gradient(#8B3DFF ${n}%, #EDE4FB 0)`;
  return <div className="ring" style={{ background: bg }}><strong>{n}%</strong><span>match</span></div>;
}

export function PersonArt() {
  return (
    <div className="person-art" aria-hidden="true">
      <svg width="220" height="240" viewBox="0 0 220 240"><circle cx="110" cy="80" r="55" fill="#000" /><path d="M20 240c0-60 40-100 90-100s90 40 90 100z" fill="#000" /></svg>
    </div>
  );
}
