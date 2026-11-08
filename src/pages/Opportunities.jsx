import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { JobTabs, OppActions, OppBand, OppTags } from '../components/Opp.jsx';
import { ErrorBox, Loading, SearchIcon, useLoad } from '../components/ui.jsx';
import { INDUSTRIES } from '../format.js';

const LIMIT = 10;

export default function Opportunities() {
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [scope, setScope] = useState('');
  const [industry, setIndustry] = useState('');
  const [page, setPage] = useState(1);

  // Search as the user types, after a short pause.
  useEffect(() => { const t = setTimeout(() => setQuery(q.trim()), 300); return () => clearTimeout(t); }, [q]);
  useEffect(() => setPage(1), [query, type, scope, industry]);

  const res = useLoad(() => api.opportunities({ q: query, type, scope, industry, page, limit: LIMIT }), [query, type, scope, industry, page]);
  const total = res.data?.total || 0;
  const pages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <>
      <OppBand active="jobs" />
      <main className="page narrow" style={{ gap: 20, paddingTop: 28 }}>
        <JobTabs />
        <div className="row" style={{ alignItems: 'flex-end' }}>
          <label className="search">
            <SearchIcon /><span className="sr-only">Search</span>
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title, company or keyword" />
          </label>
          <label className="select-label">Type
            <select value={type} onChange={(e) => setType(e.target.value)}><option value="">All types</option><option value="job">Job</option><option value="internship">Internship</option><option value="research">Research</option></select></label>
          <label className="select-label">Where
            <select value={scope} onChange={(e) => setScope(e.target.value)}><option value="">Anywhere</option><option value="local">Local</option><option value="remote">Remote</option><option value="abroad">Abroad</option></select></label>
          <label className="select-label">Industry
            <select value={industry} onChange={(e) => setIndustry(e.target.value)}><option value="">All industries</option>{INDUSTRIES.map((i) => <option key={i}>{i}</option>)}</select></label>
        </div>
        <ErrorBox error={res.error} />
        {res.loading && !res.data ? <Loading /> : (
          <>
            <p className="muted" style={{ fontSize: 14 }} aria-live="polite"><strong>{total}</strong> results · deadline soonest first</p>
            {res.data?.items.length === 0 && <div className="empty">No opportunities match these filters.</div>}
            <div>
              {res.data?.items.map((o) => (
                <article key={o.id} className="opp">
                  <div className="opp-main">
                    <Link to={`/opportunities/${o.id}`} className="opp-title">{o.title}</Link>
                    <span className="muted" style={{ fontSize: 14 }}>{o.organization} · {o.location}</span>
                    <p style={{ margin: '2px 0', fontSize: 14, lineHeight: 1.6, color: 'var(--body)' }}>{o.description}</p>
                    <OppTags o={o} />
                  </div>
                  <OppActions o={o} />
                </article>
              ))}
            </div>
            {pages > 1 && (
              <nav aria-label="Pages" className="pager">
                {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                  <button key={n} type="button" aria-current={n === page ? 'page' : undefined} onClick={() => setPage(n)}>{n}</button>
                ))}
                {page < pages && <button type="button" onClick={() => setPage(page + 1)}>Next</button>}
              </nav>
            )}
          </>
        )}
      </main>
    </>
  );
}
