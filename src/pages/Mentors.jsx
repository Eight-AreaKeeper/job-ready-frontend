import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { Avatar, ErrorBox, Loading, SearchIcon, useLoad } from '../components/ui.jsx';
import { fmtAvailability, INDUSTRIES } from '../format.js';

export function MentorFacts({ m }) {
  return (
    <>
      <div style={{ fontSize: 14 }}><strong>Areas of expertise:</strong> {m.expertise?.length ? m.expertise.join(', ') : '—'}</div>
      {m.yearsExperience != null && <div style={{ fontSize: 14 }}><strong>Experience:</strong> {m.yearsExperience} year{m.yearsExperience === 1 ? '' : 's'}</div>}
      <div style={{ fontSize: 14 }}><strong>Available:</strong> {fmtAvailability(m.availability)}</div>
    </>
  );
}

export default function Mentors() {
  const { user } = useAuth();
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const [industry, setIndustry] = useState('');
  useEffect(() => { const t = setTimeout(() => setQuery(q.trim()), 300); return () => clearTimeout(t); }, [q]);
  const res = useLoad(() => api.mentors({ q: query, industry }), [query, industry]);
  const student = user?.role === 'student';

  return (
    <main className="page" style={{ maxWidth: 1100, gap: 24 }}>
      <h1 style={{ fontWeight: 600, fontSize: 36, textAlign: 'center' }}>Connecting you with the right experts</h1>
      <div className="row" style={{ alignItems: 'flex-end' }}>
        <label className="search"><SearchIcon /><span className="sr-only">Search mentors</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, role or expertise" /></label>
        <label className="select-label">Industry
          <select value={industry} onChange={(e) => setIndustry(e.target.value)}><option value="">All industries</option>{INDUSTRIES.map((i) => <option key={i}>{i}</option>)}</select></label>
      </div>
      <ErrorBox error={res.error} />
      {res.loading && !res.data && <Loading />}
      {res.data?.items.length === 0 && <div className="empty">No mentors match yet.</div>}
      <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(420px, 100%), 1fr))' }}>
        {res.data?.items.map((m) => (
          <article key={m.id} className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
            <Avatar name={m.name} photo={m.photoUrl} size={110} />
            <div className="stack" style={{ flex: '1 1 220px', minWidth: 0, gap: 8 }}>
              <h2 style={{ fontSize: 20 }}>{m.name}</h2>
              <span className="muted" style={{ fontSize: 14 }}>{[m.headline, m.company].filter(Boolean).join(' · ')}</span>
              <MentorFacts m={m} />
              {student && <Link to={`/mentors/${m.id}/chat`} className="btn small" style={{ alignSelf: 'flex-start', marginTop: 6 }}>Request a coffee chat</Link>}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
