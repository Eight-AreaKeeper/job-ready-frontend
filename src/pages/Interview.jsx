import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { ErrorBox, Loading, useLoad } from '../components/ui.jsx';

export default function Interview() {
  const [params] = useSearchParams();
  const oppId = params.get('opportunityId');
  const opp = useLoad(() => (oppId ? api.opportunity(oppId) : Promise.resolve(null)), [oppId]);
  const [role, setRole] = useState('');
  const [session, setSession] = useState(null); // { id, questions }
  const [current, setCurrent] = useState(null);
  const [scores, setScores] = useState({}); // questionId -> score
  const [feedback, setFeedback] = useState(null); // { n, score, feedback }
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  async function start(e) {
    e?.preventDefault();
    setBusy(true); setError(null);
    try {
      const s = await api.startInterview(oppId ? { opportunityId: oppId } : { role: role.trim() });
      setSession(s); setCurrent(s.questions[0]); setScores({}); setFeedback(null); setDone(false);
    } catch (err) { setError(err); }
    setBusy(false);
  }

  async function submit() {
    if (!answer.trim()) { setError('Type an answer first.'); return; }
    setBusy(true); setError(null);
    try {
      const r = await api.answerInterview(session.id, { questionId: current.id, answer: answer.trim() });
      const n = session.questions.findIndex((q) => q.id === current.id) + 1;
      setScores((s) => ({ ...s, [current.id]: r.score }));
      setFeedback({ n, score: r.score, feedback: r.feedback });
      setAnswer('');
      if (r.nextQuestion) setCurrent(r.nextQuestion); else { setCurrent(null); setDone(true); }
    } catch (err) { setError(err); }
    setBusy(false);
  }

  const title = opp.data ? opp.data.title : session ? role : 'Mock interview';
  const qs = session?.questions || [];
  const idx = current ? qs.findIndex((q) => q.id === current.id) : qs.length;
  const scored = Object.values(scores);
  const avg = scored.length ? (scored.reduce((a, b) => a + b, 0) / scored.length).toFixed(1) : null;

  return (
    <>
      <section className="band">
        <div className="band-inner row between" style={{ flexDirection: 'row', maxWidth: 1000 }}>
          <div><p style={{ fontSize: 14, fontWeight: 600, color: 'var(--plum)' }}>Mock interview</p><h1 style={{ fontSize: 34 }}>{title}</h1></div>
          {session && (
            <ol aria-label="Progress" className="row" style={{ listStyle: 'none', margin: 0, padding: 0, gap: 14 }}>
              {qs.map((q, i) => (
                <li key={q.id} aria-current={i === idx ? 'step' : undefined} className="stack" style={{ alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--body)' }}>
                  <span style={{ width: 14, height: 14, borderRadius: '50%', background: scores[q.id] != null ? 'var(--purple)' : i === idx ? '#fff' : 'var(--lilac)', border: i === idx ? '3px solid var(--purple)' : 0 }} />
                  <span>Q{i + 1}{scores[q.id] != null ? ` · ${scores[q.id]}/10` : i === idx ? ' · now' : ''}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
      <main className="page" style={{ maxWidth: 1000, gap: 24 }}>
        <ErrorBox error={error} />
        {!session && (
          <form className="card stack" onSubmit={start} style={{ gap: 16 }}>
            <h2 style={{ fontSize: 22 }}>Practice with AI</h2>
            <p className="muted">AI asks you {opp.data ? 'questions for this job' : 'a few questions'}, scores each answer from 1 to 10 and tells you how to improve.</p>
            {!oppId && <label className="field">Which role are you practising for?<input required value={role} onChange={(e) => setRole(e.target.value)} placeholder="Data Analyst" /></label>}
            {opp.loading && oppId ? <Loading /> : <button className="btn" style={{ alignSelf: 'flex-start' }} disabled={busy}>{busy ? 'Writing your questions…' : 'Start interview'}</button>}
          </form>
        )}
        {feedback && (
          <section className="card tint row" style={{ alignItems: 'flex-start', gap: 20 }}>
            <div className="stack" style={{ alignItems: 'center', gap: 0 }}><span style={{ fontFamily: 'var(--head)', fontSize: 40, fontWeight: 700, color: 'var(--plum)' }}>{feedback.score}</span><span className="faint">out of 10</span></div>
            <div className="stack" style={{ flex: '1 1 300px', gap: 6 }}><h2 style={{ fontSize: 18 }}>Feedback on question {feedback.n}</h2><p style={{ lineHeight: 1.6, color: 'var(--body)' }}>{feedback.feedback}</p></div>
          </section>
        )}
        {current && (
          <section className="card stack" style={{ gap: 14 }}>
            <p className="faint">Question {idx + 1} of {qs.length}</p>
            <h2 style={{ fontSize: 22, lineHeight: 1.4 }}>{current.text}</h2>
            <label className="field">Your answer<textarea rows={8} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Type your answer as you would say it in the interview" /></label>
            <div className="row between">
              <span className="faint">AI scores your answer from 1 to 10 and tells you how to improve.</span>
              <div className="row">
                <button type="button" className="btn ghost" onClick={() => { setCurrent(null); setDone(true); }}>End interview</button>
                <button type="button" className="btn" onClick={submit} disabled={busy}>{busy ? 'Scoring…' : 'Submit answer'}</button>
              </div>
            </div>
          </section>
        )}
        {done && (
          <section className="card stack" style={{ gap: 12 }}>
            <h2 style={{ fontSize: 22 }}>Interview finished</h2>
            <p className="muted">{avg ? `You answered ${scored.length} of ${qs.length} questions. Average score: ${avg} / 10.` : 'You did not answer any questions this time.'}</p>
            <div className="row">
              <button type="button" className="btn" onClick={start} disabled={busy}>Practise again</button>
              {oppId && <Link to={`/opportunities/${oppId}`} className="btn outline">Back to the job</Link>}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
