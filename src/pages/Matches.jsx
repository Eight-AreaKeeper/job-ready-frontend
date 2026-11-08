import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { JobTabs, OppActions, OppBand } from '../components/Opp.jsx';
import { Chip, ErrorBox, Loading, MatchRing, Sparkle, useLoad } from '../components/ui.jsx';
import { cap } from '../format.js';

const SCOPES = [['', 'All'], ['local', 'Local'], ['remote', 'Remote'], ['abroad', 'Abroad']];

export default function Matches() {
  const [scope, setScope] = useState('');
  const res = useLoad(() => api.matches({ scope, limit: 10 }), [scope]);
  const noProfile = res.error?.status === 404;

  return (
    <>
      <OppBand active="jobs" />
      <main className="page narrow" style={{ gap: 20, paddingTop: 28 }}>
        <div className="row between">
          <JobTabs />
          <div className="row" style={{ gap: 8 }}>
            <span className="faint" style={{ fontSize: 14 }}>Where</span>
            {SCOPES.map(([v, l]) => <Chip key={l} on={scope === v} onClick={() => setScope(v)}>{l}</Chip>)}
          </div>
        </div>
        <p className="row muted" style={{ gap: 8, fontSize: 14 }}><Sparkle size={18} />Ranked by AI against your career profile. This can take up to 20 seconds.</p>
        {noProfile ? (
          <div className="empty stack" style={{ alignItems: 'center' }}>
            <p>Recommendations need your career profile first.</p>
            <Link className="btn" to="/profile/setup">Make a Profile</Link>
          </div>
        ) : <ErrorBox error={res.error} />}
        {res.loading && <Loading>Finding the best matches for you…</Loading>}
        {!res.loading && res.data?.items.length === 0 && <div className="empty">No matches for this filter yet.</div>}
        {!res.loading && res.data?.items.map((m) => {
          const o = m.opportunity;
          return (
            <article key={o.id} className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'flex-start' }}>
              <MatchRing score={m.matchScore} />
              <div className="stack" style={{ flex: '1 1 360px', minWidth: 0, gap: 8 }}>
                <Link to={`/opportunities/${o.id}`} state={{ match: m }} className="opp-title" style={{ fontSize: 20 }}>{o.title}</Link>
                <span className="muted" style={{ fontSize: 15 }}>{o.organization} · {o.location}</span>
                <div className="chips" style={{ gap: 6 }}><span className="tag">{cap(o.type)}</span><span className="tag">{cap(o.scope)}</span></div>
                <ul style={{ margin: '4px 0 0', paddingLeft: 18, fontSize: 14, lineHeight: 1.6, color: 'var(--body)' }}>
                  {(m.reasons || []).map((r) => <li key={r}>{r}</li>)}
                </ul>
              </div>
              <OppActions o={o} match={m} />
            </article>
          );
        })}
      </main>
    </>
  );
}
