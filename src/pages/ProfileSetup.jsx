import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { Chip, ErrorBox, Loading, PersonArt, useLoad } from '../components/ui.jsx';
import { INDUSTRIES } from '../format.js';

export default function ProfileSetup() {
  const navigate = useNavigate();
  const questions = useLoad(() => api.profileQuestions(), []);
  const [answers, setAnswers] = useState({});
  const [industries, setIndustries] = useState([]);
  const [location, setLocation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const setAnswer = (id, v) => setAnswers((a) => ({ ...a, [id]: v }));
  const toggleIndustry = (i) => setIndustries((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : cur.length < 3 ? [...cur, i] : cur));

  async function submit(e) {
    e.preventDefault();
    const items = questions.data?.items || [];
    const list = items.map((q) => ({ questionId: q.id, answer: (answers[q.id] || '').trim() })).filter((a) => a.answer);
    if (!list.length) { setError('Answer at least one question so AI has something to work with.'); return; }
    setBusy(true);
    setError(null);
    try {
      await api.submitProfile({ answers: list, industries, location: location.trim() || undefined });
      navigate('/profile');
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <main className="page" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 48, alignItems: 'flex-start', paddingTop: 16 }}>
      <form className="panel stack" style={{ flex: '999 1 560px', minWidth: 0, gap: 22 }} onSubmit={submit}>
        <div>
          <h1 style={{ fontWeight: 600, fontSize: 30, color: 'var(--plum)' }}>Make a Profile</h1>
          <p className="muted" style={{ marginTop: 6, fontSize: 15 }}>Answer in your own words. AI turns your answers into a career profile you can edit later.</p>
        </div>
        {questions.loading && <Loading>Loading questions…</Loading>}
        <ErrorBox error={questions.error} />
        {(questions.data?.items || []).map((q) => (q.type === 'single_select' ? (
          <fieldset key={q.id}>
            <legend>{q.text}</legend>
            <div className="chips">
              {(q.options || []).map((o) => <Chip key={o} on={answers[q.id] === o} onClick={() => setAnswer(q.id, o)}>{o}</Chip>)}
            </div>
          </fieldset>
        ) : /describe|tell/i.test(q.text) ? (
          <label key={q.id} className="field">{q.text}
            <textarea rows={4} value={answers[q.id] || ''} onChange={(e) => setAnswer(q.id, e.target.value)} placeholder="What did you build or do, and what was the result?" />
          </label>
        ) : (
          <label key={q.id} className="field">{q.text}
            <input value={answers[q.id] || ''} onChange={(e) => setAnswer(q.id, e.target.value)} />
          </label>
        )))}
        {questions.data && (
          <>
            <fieldset>
              <legend>What industries are you interested in? <span style={{ fontWeight: 400, color: 'var(--faint)' }}>Pick up to 3 ({industries.length} chosen)</span></legend>
              <div className="chips">
                {INDUSTRIES.map((i) => <Chip key={i} on={industries.includes(i)} onClick={() => toggleIndustry(i)} disabled={!industries.includes(i) && industries.length >= 3}>{i}</Chip>)}
              </div>
            </fieldset>
            <label className="field">Your city<input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Calgary, AB" /></label>
            <ErrorBox error={error} />
            <button className="btn block" disabled={busy} style={{ fontSize: 16, padding: 14 }}>{busy ? 'Building your profile…' : 'Submit'}</button>
            <p className="faint" style={{ marginTop: -8, textAlign: 'center' }}>Building your profile takes about 5–20 seconds.</p>
          </>
        )}
      </form>
      <div style={{ flex: '1 1 320px', minWidth: 0, display: 'flex', justifyContent: 'center', paddingTop: 24 }}><PersonArt /></div>
    </main>
  );
}
