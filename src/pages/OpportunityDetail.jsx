import { Link, useLocation, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { ErrorBox, Loading, useLoad } from '../components/ui.jsx';
import { cap, daysUntil, fmtDate } from '../format.js';

const Have = () => <svg role="img" aria-label="You have this" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1F7A4D" strokeWidth="2.5"><path d="M5 12l5 5 9-10" /></svg>;
const Missing = () => <svg role="img" aria-label="Missing" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B4530A" strokeWidth="2.5"><circle cx="12" cy="12" r="9" /><path d="M12 7v6M12 16.5v.5" /></svg>;

export default function OpportunityDetail() {
  const { id } = useParams();
  const match = useLocation().state?.match;
  const res = useLoad(async () => {
    const [opp, profile] = await Promise.all([
      api.opportunity(id),
      api.getProfile().catch(() => null),
    ]);
    return { opp, profile };
  }, [id]);

  if (res.loading) return <main className="page"><Loading /></main>;
  if (res.error) return <main className="page"><ErrorBox error={res.error} /><Link to="/opportunities">← Back to opportunities</Link></main>;
  const { opp: o, profile } = res.data;
  const skills = (profile?.skills || []).map((s) => s.toLowerCase());
  const has = (r) => skills.some((s) => s === r.toLowerCase() || s.includes(r.toLowerCase()) || r.toLowerCase().includes(s));
  const days = daysUntil(o.deadline);

  return (
    <>
      <section className="band">
        <div className="band-inner" style={{ maxWidth: 1100 }}>
          <Link to="/opportunities" style={{ fontSize: 14, color: 'var(--plum)', fontWeight: 600 }}>← Back to opportunities</Link>
          <h1 style={{ fontSize: 38 }}>{o.title}</h1>
          <p style={{ fontSize: 17, color: 'var(--body)' }}>{o.organization} · {o.location}</p>
          <div className="chips" style={{ gap: 6 }}>
            <span className="tag big" style={{ background: '#fff' }}>{cap(o.type)}</span>
            <span className="tag big" style={{ background: '#fff' }}>{cap(o.scope)}</span>
            {o.industry && <span className="tag big" style={{ background: '#fff' }}>{o.industry}</span>}
            <span className="tag big" style={{ background: '#fff' }}>Deadline {fmtDate(o.deadline)}</span>
          </div>
        </div>
      </section>
      <main className="page split" style={{ maxWidth: 1100 }}>
        <div className="grow stack" style={{ gap: 32 }}>
          <section className="stack">
            <h2 style={{ fontSize: 22 }}>About the role</h2>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--body)', whiteSpace: 'pre-line' }}>{o.description}</p>
          </section>
          {o.requirements?.length > 0 && (
            <section className="stack">
              <h2 style={{ fontSize: 22 }}>Requirements</h2>
              {profile && <p className="faint">Compared with your profile</p>}
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 16 }}>
                {o.requirements.map((r) => (
                  <li key={r} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {profile ? (has(r) ? <Have /> : <Missing />) : <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--purple)' }} />}
                    {r}{profile && !has(r) && <span className="faint">not on your profile yet</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {match && (
            <section className="card tint stack">
              <div className="row"><span className="tag big" style={{ background: 'var(--purple)', color: '#fff' }}>{Math.round(match.matchScore * 100)}%</span><h2 style={{ fontSize: 20 }}>Why this fits you</h2></div>
              <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7, color: 'var(--body)' }}>{match.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
            </section>
          )}
        </div>
        <aside className="side card stack" style={{ alignItems: 'stretch', textAlign: 'center' }}>
          <p className="muted">{days >= 0 ? 'Closes in' : 'Closed'}</p>
          <p style={{ fontFamily: 'var(--head)', fontSize: 34, fontWeight: 700, color: 'var(--plum)' }}>{days >= 0 ? `${days} day${days === 1 ? '' : 's'}` : fmtDate(o.deadline)}</p>
          <Link to={`/opportunities/${o.id}/apply`} className="btn">Apply</Link>
          <Link to={`/interview?opportunityId=${o.id}`} className="btn outline">Practice an interview</Link>
          {o.url && <a href={o.url} target="_blank" rel="noreferrer" className="btn outline">Company page</a>}
        </aside>
      </main>
    </>
  );
}
