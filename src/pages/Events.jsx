import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { OppBand } from '../components/Opp.jsx';
import { ArrowOut, Chip, ErrorBox, Loading, SearchIcon, useLoad } from '../components/ui.jsx';
import { fmtTime, KIND_LABELS } from '../format.js';

const KINDS = [['', 'All'], ...Object.entries(KIND_LABELS)];

export default function Events() {
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const [format, setFormat] = useState('');
  const [kind, setKind] = useState('');
  useEffect(() => { const t = setTimeout(() => setQuery(q.trim()), 300); return () => clearTimeout(t); }, [q]);
  const res = useLoad(() => api.events({ q: query, format, kind, limit: 50 }), [query, format, kind]);

  return (
    <>
      <OppBand active="events" />
      <main className="page narrow" style={{ gap: 20, paddingTop: 28 }}>
        <div className="row" style={{ alignItems: 'flex-end' }}>
          <label className="search"><SearchIcon /><span className="sr-only">Search events</span>
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search events by name, host or city" /></label>
          <label className="select-label">Format
            <select value={format} onChange={(e) => setFormat(e.target.value)}><option value="">In person and online</option><option value="in_person">In person</option><option value="online">Online</option></select></label>
        </div>
        <div className="chips">{KINDS.map(([v, l]) => <Chip key={l} on={kind === v} onClick={() => setKind(v)}>{l}</Chip>)}</div>
        <ErrorBox error={res.error} />
        {res.loading && !res.data ? <Loading /> : (
          <>
            <p className="muted" style={{ fontSize: 14 }} aria-live="polite"><strong>{res.data?.total ?? 0}</strong> upcoming events · date soonest first</p>
            {res.data?.items.length === 0 && <div className="empty">No upcoming events match these filters.</div>}
            {res.data?.items.map((e) => {
              const d = new Date(e.startsAt);
              return (
                <article key={e.id} className="event">
                  <div className="date-block">
                    <div className="m">{d.toLocaleDateString('en-CA', { month: 'short' }).toUpperCase().replace('.', '')}</div>
                    <div className="d">{String(d.getDate()).padStart(2, '0')}</div>
                    <div className="w">{d.toLocaleDateString('en-CA', { weekday: 'short' })}</div>
                  </div>
                  <div className="stack" style={{ flex: '1 1 400px', minWidth: 0, gap: 8 }}>
                    <h2 style={{ fontSize: 19 }}>{e.title}</h2>
                    <span className="muted" style={{ fontSize: 14 }}>{e.host}</span>
                    <div className="meta">
                      <span><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6A1FD8" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>{fmtTime(e.startsAt)}{e.endsAt ? ` – ${fmtTime(e.endsAt)}` : ''}</span>
                      <span><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6A1FD8" strokeWidth="2"><path d="M12 21s-7-6.5-7-11a7 7 0 0114 0c0 4.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>{e.location || (e.format === 'online' ? 'Online' : 'TBA')}</span>
                    </div>
                    {e.description && <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--body)' }}>{e.description}</p>}
                    <div className="chips" style={{ gap: 6 }}><span className="tag">{KIND_LABELS[e.kind] || e.kind}</span><span className="tag">{e.format === 'online' ? 'Online' : 'In person'}</span></div>
                  </div>
                  {e.url && <a href={e.url} target="_blank" rel="noreferrer" className="btn small">Register <ArrowOut /></a>}
                </article>
              );
            })}
          </>
        )}
      </main>
    </>
  );
}
