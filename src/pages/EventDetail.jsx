import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { OppBand } from '../components/Opp.jsx';
import { ErrorBox, Loading, useLoad } from '../components/ui.jsx';
import { useEventRegistrations } from '../eventRegistration.js';
import { fmtDate, fmtTime, KIND_LABELS } from '../format.js';

export default function EventDetail() {
  const { id } = useParams();
  const res = useLoad(() => api.event(id), [id]);
  const { isRegistered, register } = useEventRegistrations();

  if (res.loading) return <main className="page"><Loading /></main>;
  if (res.error) return <main className="page"><ErrorBox error={res.error} /><Link to="/events">← Back to events</Link></main>;
  const e = res.data;
  const done = isRegistered(e.id);
  const where = e.location || (e.format === 'online' ? 'Online' : 'TBA');

  return (
    <>
      <OppBand active="events" />
      <main className="page split" style={{ paddingTop: 28 }}>
        <div className="grow stack" style={{ gap: 20 }}>
          <Link to="/events" className="muted" style={{ fontSize: 14 }}>← Back to events</Link>
          <div className="stack" style={{ gap: 6 }}>
            <h1 style={{ fontSize: 30 }}>{e.title}</h1>
            <span className="muted">{e.host}</span>
          </div>
          <div className="chips" style={{ gap: 6 }}>
            <span className="tag">{KIND_LABELS[e.kind] || e.kind}</span>
            <span className="tag">{e.format === 'online' ? 'Online' : 'In person'}</span>
          </div>
          <section className="stack" style={{ gap: 8 }}>
            <h2 style={{ fontSize: 20 }}>About this event</h2>
            <p style={{ lineHeight: 1.7, color: 'var(--body)' }}>{e.description || 'No description yet.'}</p>
          </section>
        </div>
        <aside className="side card stack" style={{ gap: 12 }}>
          <div><div className="muted" style={{ fontSize: 13 }}>Date</div><strong>{fmtDate(e.startsAt, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</strong></div>
          <div><div className="muted" style={{ fontSize: 13 }}>Time</div><strong>{fmtTime(e.startsAt)}{e.endsAt ? ` – ${fmtTime(e.endsAt)}` : ''}</strong></div>
          <div><div className="muted" style={{ fontSize: 13 }}>Where</div><strong>{where}</strong></div>
          {done
            ? <button type="button" className="btn" disabled>Registered</button>
            : <button type="button" className="btn" onClick={() => register(e.id)}>Register</button>}
          {done && <p role="status" className="registered">✓ Registered successfully. See you there!</p>}
        </aside>
      </main>
    </>
  );
}
