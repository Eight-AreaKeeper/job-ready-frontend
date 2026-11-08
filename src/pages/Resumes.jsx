import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { api, downloadResumePdf } from '../api.js';
import { useAuth } from '../auth.jsx';
import { ArrowOut, ErrorBox, Loading, useLoad } from '../components/ui.jsx';
import { fmtDate } from '../format.js';

function ResumePaper({ resume, user, location }) {
  const s = resume.sections || {};
  const range = (x) => [x.start, x.end].filter(Boolean).join(' – ');
  return (
    <article className="paper" aria-label="Resume preview">
      <h3>{user.name}</h3>
      <p className="faint">{[location, user.email].filter(Boolean).join(' · ')}</p>
      {s.summary && <p style={{ marginTop: 10 }}>{s.summary}</p>}
      {s.skills?.length > 0 && <><h4>SKILLS</h4><p>{s.skills.join(' · ')}</p></>}
      {s.experience?.length > 0 && <><h4>EXPERIENCE</h4>{s.experience.map((x, i) => (
        <div key={i}><div className="line"><strong>{[x.title, x.org].filter(Boolean).join(', ')}</strong><span className="faint">{range(x)}</span></div>
          {x.bullets?.length > 0 && <ul>{x.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>}</div>))}</>}
      {s.projects?.length > 0 && <><h4>PROJECTS</h4>{s.projects.map((x, i) => (
        <div key={i}><strong>{x.name}</strong>{x.bullets?.length > 0 && <ul>{x.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>}</div>))}</>}
      {s.education?.length > 0 && <><h4>EDUCATION</h4>{s.education.map((x, i) => (
        <div key={i} className="line"><span><strong>{x.school}</strong>{x.degree ? `, ${x.degree}` : ''}</span><span className="faint">{x.end}</span></div>))}</>}
    </article>
  );
}

export default function Resumes() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const routeState = useLocation().state;
  const applyId = params.get('apply');
  const list = useLoad(() => api.resumes(), []);
  const profile = useLoad(() => api.getProfile().catch(() => null), []);
  const applyOpp = useLoad(() => (applyId ? api.opportunity(applyId) : Promise.resolve(null)), [applyId]);
  const items = list.data?.items || [];
  const selectedId = params.get('id') || items[0]?.id;
  const selected = items.find((r) => r.id === selectedId);
  const [changes, setChanges] = useState(routeState?.changes || null);
  const [tips, setTips] = useState(null);
  const [tipsBusy, setTipsBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const select = (id) => { setParams(applyId && id === params.get('id') ? params : { id }); setChanges(null); setTips(null); };

  async function loadTips(r = selected) {
    if (!r) return;
    setTipsBusy(true);
    setError(null);
    try {
      const d = await api.suggestions(r.id, r.opportunityId ? { opportunityId: r.opportunityId } : {});
      setTips(d.suggestions);
    } catch (e) { setError(e); }
    setTipsBusy(false);
  }

  // Suggestions come from AI: load them automatically right after tailoring or when asked for.
  useEffect(() => {
    if (selected && !tips && !tipsBusy && (applyId || params.get('suggest'))) loadTips(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  async function rewriteBase() {
    setBusy(true);
    setError(null);
    try {
      const r = await api.generateResume();
      list.reload();
      setParams({ id: r.id });
      setChanges(null); setTips(null);
    } catch (e) {
      setError(e.status === 404 ? 'Make your career profile first: every resume is written from it.' : e.message);
    }
    setBusy(false);
  }

  async function download() {
    setError(null);
    try { await downloadResumePdf(selected.id, `${selected.title.replace(/[^\w ]+/g, '').trim() || 'resume'}.pdf`); }
    catch (e) { setError(e); }
  }

  if (list.loading && !list.data) return <main className="page"><Loading /></main>;
  const opp = applyOpp.data;

  return (
    <main className="page split" style={{ alignItems: 'flex-start' }}>
      <aside className="side stack" style={{ flex: '1 1 240px', maxWidth: 300 }}>
        <h1 style={{ fontSize: 24 }}>My resumes</h1>
        <div className="side-list">
          {items.map((r) => (
            <button key={r.id} type="button" aria-current={r.id === selectedId} onClick={() => select(r.id)}>
              <strong>{r.title}</strong><span>{fmtDate(r.createdAt, { month: 'short', day: 'numeric' })}</span>
            </button>
          ))}
        </div>
        <button type="button" className="btn outline" onClick={rewriteBase} disabled={busy}>{busy ? 'Writing…' : items.some((r) => !r.opportunityId) ? 'Rewrite base resume with AI' : 'Write my base resume with AI'}</button>
        <p className="faint">You have one base resume. Rewriting it replaces the old version. Tailored resumes are made when you apply to a job.</p>
      </aside>

      <div className="grow stack" style={{ gap: 20 }}>
        <ErrorBox error={error || list.error} />
        {error && /profile first/.test(String(error)) && <Link to="/profile/setup" className="btn" style={{ alignSelf: 'flex-start' }}>Make a Profile</Link>}
        {opp && selected?.opportunityId === opp.id && (
          <section className="card tint row between">
            <div className="stack" style={{ gap: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--plum)' }}>Step 2 of 2 · Your application</span>
              <h2 style={{ fontSize: 22 }}>Resume tailored for {opp.title}</h2>
              <p className="muted">{opp.organization}. Download it, then send it with your application.</p>
            </div>
            {opp.url && <a href={opp.url} target="_blank" rel="noreferrer" className="btn">Continue to application <ArrowOut size={16} /></a>}
          </section>
        )}
        {!selected ? (
          <div className="empty stack" style={{ alignItems: 'center' }}>
            <p>No resumes yet. Write your base resume from your profile, or tailor one when you apply to a job.</p>
            <Link to="/opportunities" className="btn outline">Find a job to apply to</Link>
          </div>
        ) : (
          <div className="split" style={{ gap: 24 }}>
            <div className="grow"><ResumePaper resume={selected} user={user} location={profile.data?.location} /></div>
            <div className="side stack" style={{ gap: 18 }}>
              <button type="button" className="btn" onClick={download}>
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></svg>Download PDF</button>
              {changes?.length > 0 && (
                <section className="card soft stack" style={{ gap: 8 }}>
                  <h3 style={{ fontSize: 17 }}>What the AI changed</h3>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.6, color: 'var(--body)' }}>{changes.map((c) => <li key={c}>{c}</li>)}</ul>
                </section>
              )}
              <section className="card stack" style={{ gap: 4 }}>
                <div className="row between"><h3 style={{ fontSize: 17 }}>How to improve</h3>
                  <button type="button" className="link-btn" style={{ color: 'var(--purple-text)', fontWeight: 600 }} onClick={() => loadTips()} disabled={tipsBusy}>{tips ? 'Refresh' : 'Get suggestions'}</button></div>
                {tipsBusy && <Loading>Asking AI…</Loading>}
                {!tipsBusy && !tips && <p className="faint">AI finds missing qualifications, ways to gain experience and better wording.</p>}
                {!tipsBusy && tips?.map((t, i) => (
                  <div key={i} className="suggestion"><span className="kind">{t.type.toUpperCase()}</span><strong style={{ fontSize: 14 }}>{t.text}</strong><span className="faint">{t.reason}</span></div>
                ))}
              </section>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
