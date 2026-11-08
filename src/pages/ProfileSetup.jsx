import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { Chip, ErrorBox, Loading, PersonArt, useLoad } from '../components/ui.jsx';
import { INDUSTRIES } from '../format.js';

const PREFERENCE = 'Opportunity preference';

function Question({ q, value, onChange }) {
  if (q.type === 'single_select') {
    return (
      <fieldset>
        <legend>{q.text}</legend>
        <div className="chips">
          {(q.options || []).map((o) => <Chip key={o} on={value === o} onClick={() => onChange(value === o ? '' : o)}>{o}</Chip>)}
        </div>
      </fieldset>
    );
  }
  const Tag = q.type === 'long_text' ? 'textarea' : 'input';
  return (
    <label className="field">{q.text}
      <Tag rows={q.type === 'long_text' ? 3 : undefined} value={value || ''} placeholder={q.placeholder ? `e.g. ${q.placeholder}` : undefined} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function Section({ n, title, note, children }) {
  return (
    <section className="q-section">
      <h3><span className="q-num">{n}</span>{title}</h3>
      {note && <p className="faint" style={{ margin: '-6px 0 0' }}>{note}</p>}
      {children}
    </section>
  );
}

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const questions = useLoad(() => api.profileQuestions(), []);
  const [answers, setAnswers] = useState({});
  const [industries, setIndustries] = useState([]);
  const [location, setLocation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const setAnswer = (id, v) => setAnswers((a) => ({ ...a, [id]: v }));
  const toggleIndustry = (i) => setIndustries((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : cur.length < 3 ? [...cur, i] : cur));

  // Group the back end's questions by section, keeping their order.
  const sections = useMemo(() => {
    const out = [];
    for (const q of questions.data?.items || []) {
      const name = q.section || 'More about you';
      let s = out.find((x) => x.name === name);
      if (!s) out.push((s = { name, items: [] }));
      s.items.push(q);
    }
    return out;
  }, [questions.data]);
  const hasPreference = sections.some((s) => s.name === PREFERENCE);
  const answered = (questions.data?.items || []).filter((q) => (answers[q.id] || '').trim()).length;
  const total = questions.data?.items?.length || 0;

  async function submit(e) {
    e.preventDefault();
    const list = (questions.data?.items || []).map((q) => ({ questionId: q.id, answer: (answers[q.id] || '').trim() })).filter((a) => a.answer);
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

  const industryPicker = (
    <fieldset>
      <legend>What industries are you interested in? <span style={{ fontWeight: 400, color: 'var(--faint)' }}>Pick up to 3 ({industries.length} chosen)</span></legend>
      <div className="chips">
        {INDUSTRIES.map((i) => <Chip key={i} on={industries.includes(i)} onClick={() => toggleIndustry(i)} disabled={!industries.includes(i) && industries.length >= 3}>{i}</Chip>)}
      </div>
    </fieldset>
  );

  return (
    <main className="page" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 48, alignItems: 'flex-start', paddingTop: 16 }}>
      <form className="panel stack" style={{ flex: '999 1 560px', minWidth: 0, gap: 28, padding: 0, overflow: 'hidden' }} onSubmit={submit}>
        <div className="q-band">
          <h1>Make a Profile</h1>
          <p>Fill in what you can and skip what doesn't apply. AI turns your answers into a career profile you can edit later.</p>
        </div>
        <div className="stack" style={{ gap: 28, padding: '0 36px 32px' }}>
          {questions.loading && <Loading>Loading questions…</Loading>}
          <ErrorBox error={questions.error} />
          {questions.data && (
            <>
              <Section n={1} title="Personal info" note="Name and email come from your account.">
                <div className="q-grid">
                  <label className="field">Name<input value={user?.name || ''} readOnly /></label>
                  <label className="field">Email<input value={user?.email || ''} readOnly /></label>
                </div>
                <label className="field">Your city<input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Calgary, AB" /></label>
              </Section>
              {sections.map((s, i) => (
                <Section key={s.name} n={i + 2} title={s.name}>
                  {s.items.map((q) => <Question key={q.id} q={q} value={answers[q.id]} onChange={(v) => setAnswer(q.id, v)} />)}
                  {s.name === PREFERENCE && industryPicker}
                </Section>
              ))}
              {!hasPreference && <Section n={sections.length + 2} title={PREFERENCE}>{industryPicker}</Section>}
              <ErrorBox error={error} />
              <button className="btn block" disabled={busy} style={{ fontSize: 16, padding: 14 }}>{busy ? 'Building your profile…' : 'Submit'}</button>
              <p className="faint" style={{ marginTop: -14, textAlign: 'center' }}>{answered} of {total} answered. Building your profile takes about 5–20 seconds.</p>
            </>
          )}
        </div>
      </form>
      <div style={{ flex: '1 1 320px', minWidth: 0, display: 'flex', justifyContent: 'center', paddingTop: 24, position: 'sticky', top: 24 }}><PersonArt /></div>
    </main>
  );
}
