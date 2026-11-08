import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { ArrowOut, ErrorBox, Loading, Sparkle, useLoad } from '../components/ui.jsx';
import { fmtDate } from '../format.js';

const cardStyle = { textAlign: 'left', cursor: 'pointer', padding: 26, borderRadius: 14, display: 'flex', flexDirection: 'column', gap: 12, font: 'inherit', color: 'var(--ink)' };

export default function Apply() {
  const { id } = useParams();
  const navigate = useNavigate();
  const opp = useLoad(() => api.opportunity(id), [id]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function tailor() {
    setBusy(true);
    setError(null);
    try {
      const r = await api.tailorResume({ opportunityId: id });
      navigate(`/resumes?id=${r.resume.id}&apply=${id}`, { state: { changes: r.changes } });
    } catch (e) {
      setError(e.status === 404 && /profile/i.test(e.message) ? 'Make your career profile first: the tailored resume is written from it.' : e.message);
      setBusy(false);
    }
  }

  if (opp.loading) return <main className="page"><Loading /></main>;
  if (opp.error) return <main className="page"><ErrorBox error={opp.error} /></main>;
  const o = opp.data;
  return (
    <>
      <section className="band">
        <div className="band-inner" style={{ maxWidth: 1000 }}>
          <Link to={`/opportunities/${id}`} style={{ fontSize: 14, color: 'var(--plum)', fontWeight: 600 }}>← Back to the job</Link>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--plum)' }}>Step 1 of 2 · Your application</span>
          <h1 style={{ fontSize: 36 }}>Apply to {o.title}</h1>
          <p style={{ fontSize: 16, color: 'var(--body)' }}>{o.organization} · {o.location} · Due {fmtDate(o.deadline)}</p>
        </div>
      </section>
      <main className="page" style={{ maxWidth: 1000, gap: 20 }}>
        <h2 style={{ fontSize: 22 }}>Which resume do you want to send?</h2>
        <ErrorBox error={error} />
        {error && /profile/.test(error) && <Link to="/profile/setup" className="btn" style={{ alignSelf: 'flex-start' }}>Make a Profile</Link>}
        <div className="grid-cards">
          <button type="button" onClick={tailor} disabled={busy} style={{ ...cardStyle, border: '2px solid var(--purple)', background: 'var(--tint)' }}>
            <span className="tag" style={{ background: 'var(--purple)', color: '#fff', alignSelf: 'flex-start' }}>RECOMMENDED</span>
            <Sparkle size={34} width={1.6} />
            <strong style={{ fontFamily: 'var(--head)', fontSize: 20 }}>Tailor my resume for this job</strong>
            <span style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--body)' }}>AI rewrites your resume to highlight the skills this job asks for, using only facts from your profile. Takes about 10 seconds.</span>
            <span className="btn" style={{ alignSelf: 'flex-start', marginTop: 6 }}>{busy ? 'Tailoring your resume…' : 'Tailor and continue'}</span>
          </button>
          <a href={o.url || '#'} target="_blank" rel="noreferrer" style={{ ...cardStyle, border: '2px solid var(--line)' }}>
            <span className="tag" style={{ alignSelf: 'flex-start' }}>QUICK</span>
            <svg aria-hidden="true" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#4A1170" strokeWidth="1.6"><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h4" /></svg>
            <strong style={{ fontFamily: 'var(--head)', fontSize: 20 }}>Use my base resume</strong>
            <span style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--body)' }}>Go straight to the company's application page with the resume you already have.</span>
            <span className="btn outline" style={{ alignSelf: 'flex-start', marginTop: 6 }}>Continue to application <ArrowOut /></span>
          </a>
        </div>
        {busy && <Loading>AI is writing your tailored resume…</Loading>}
      </main>
    </>
  );
}
