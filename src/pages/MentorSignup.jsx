import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { Chip, ErrorBox, Loading, PersonArt } from '../components/ui.jsx';
import { DAY_NAMES, DAYS, INDUSTRIES } from '../format.js';

const blank = { headline: '', company: '', yearsExperience: '', photoUrl: '', industries: [], expertise: [], availability: [{ day: 'Tue', start: '18:00', end: '19:00' }], maxChatsPerWeek: 2 };

export default function MentorSignup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [f, setF] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [tag, setTag] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.mentors().then(({ items }) => {
      const mine = items.find((m) => m.userId === user.id);
      setIsEdit(!!mine);
      setF(mine ? { ...blank, ...mine, company: mine.company || '', photoUrl: mine.photoUrl || '', yearsExperience: mine.yearsExperience ?? '' } : blank);
    }).catch((e) => { setError(e); setF(blank); });
  }, [user.id]);

  if (!f) return <main className="page"><Loading /></main>;
  const set = (k, v) => setF({ ...f, [k]: v });
  const addTag = () => { const t = tag.trim(); if (t && !f.expertise.includes(t)) set('expertise', [...f.expertise, t]); setTag(''); };
  const setSlot = (i, k, v) => set('availability', f.availability.map((s, j) => (j === i ? { ...s, [k]: v } : s)));

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      await api.mentorSignUp({
        headline: f.headline.trim(), company: f.company.trim() || null, industries: f.industries, expertise: f.expertise,
        availability: f.availability.filter((s) => s.start && s.end), maxChatsPerWeek: f.maxChatsPerWeek,
        yearsExperience: f.yearsExperience === '' ? null : Number(f.yearsExperience), photoUrl: f.photoUrl.trim() || null,
      });
      navigate('/mentor/dashboard');
    } catch (err) { setError(err); setBusy(false); }
  }

  return (
    <main className="page" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 48, alignItems: 'flex-start', paddingTop: 16 }}>
      <form className="panel stack" style={{ flex: '999 1 560px', minWidth: 0, gap: 22 }} onSubmit={submit}>
        <div>
          <h1 style={{ fontWeight: 600, fontSize: 30, color: 'var(--plum)' }}>{isEdit ? 'Edit your mentor card' : 'Make a Profile as a Mentor'}</h1>
          <p className="muted" style={{ marginTop: 6, fontSize: 15 }}>This becomes your mentor card. Students see it when they look for someone to talk to.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          <label className="field">Your role *<input required value={f.headline} onChange={(e) => set('headline', e.target.value)} placeholder="Data Engineer" /></label>
          <label className="field">Company or institution<input value={f.company} onChange={(e) => set('company', e.target.value)} placeholder="Foothills Energy" /></label>
          <label className="field">Years of experience<input type="number" min="0" max="70" value={f.yearsExperience} onChange={(e) => set('yearsExperience', e.target.value)} placeholder="8" /></label>
        </div>
        <label className="field">Photo link <span className="hint">optional, a link to an image of you</span><input type="url" value={f.photoUrl} onChange={(e) => set('photoUrl', e.target.value)} placeholder="https://…" /></label>
        <fieldset>
          <legend>Your industries</legend>
          <div className="chips">{INDUSTRIES.map((i) => <Chip key={i} on={f.industries.includes(i)} onClick={() => set('industries', f.industries.includes(i) ? f.industries.filter((x) => x !== i) : [...f.industries, i])}>{i}</Chip>)}</div>
        </fieldset>
        <div className="stack" style={{ gap: 8 }}>
          <label htmlFor="exp" style={{ fontSize: 14, fontWeight: 600, color: 'var(--plum)' }}>Areas of expertise <span style={{ fontWeight: 400, color: 'var(--faint)' }}>What can students ask you about?</span></label>
          <div className="chips" style={{ alignItems: 'center', padding: 10, border: '1.5px solid var(--input)', borderRadius: 6 }}>
            {f.expertise.map((t) => <span key={t} className="tag big">{t}<button type="button" aria-label={`Remove ${t}`} onClick={() => set('expertise', f.expertise.filter((x) => x !== t))}>×</button></span>)}
            <input id="exp" value={tag} onChange={(e) => setTag(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} onBlur={addTag} placeholder="Add and press Enter" style={{ border: 0, outline: 'none', flex: 1, minWidth: 160, fontSize: 15, padding: 6 }} />
          </div>
        </div>
        <fieldset className="stack" style={{ gap: 10 }}>
          <legend>When are you available?</legend>
          {f.availability.map((s, i) => (
            <div key={i} className="row" style={{ gap: 10 }}>
              <label><span className="sr-only">Day</span><select className="input" value={s.day} onChange={(e) => setSlot(i, 'day', e.target.value)}>{DAYS.map((d) => <option key={d} value={d}>{DAY_NAMES[d]}</option>)}</select></label>
              <label><span className="sr-only">From</span><input className="input" type="time" value={s.start} onChange={(e) => setSlot(i, 'start', e.target.value)} /></label>
              <span>to</span>
              <label><span className="sr-only">To</span><input className="input" type="time" value={s.end} onChange={(e) => setSlot(i, 'end', e.target.value)} /></label>
              <button type="button" className="link-btn" aria-label={`Remove time ${i + 1}`} onClick={() => set('availability', f.availability.filter((_, j) => j !== i))}>Remove</button>
            </div>
          ))}
          <button type="button" className="link-btn" style={{ alignSelf: 'flex-start', color: 'var(--purple-text)', fontWeight: 600 }} onClick={() => set('availability', [...f.availability, { day: 'Thu', start: '18:00', end: '19:00' }])}>+ Add a time</button>
        </fieldset>
        <div className="row">
          <span id="maxl" style={{ fontSize: 14, fontWeight: 600, color: 'var(--plum)' }}>Most coffee chats per week</span>
          <div role="group" aria-labelledby="maxl" className="row" style={{ gap: 0, border: '2px solid var(--line)', borderRadius: 8 }}>
            <button type="button" aria-label="Fewer" className="link-btn" style={{ width: 40, height: 40, fontSize: 20, color: 'var(--plum)' }} onClick={() => set('maxChatsPerWeek', Math.max(1, f.maxChatsPerWeek - 1))}>−</button>
            <span style={{ minWidth: 32, textAlign: 'center', fontWeight: 600 }}>{f.maxChatsPerWeek}</span>
            <button type="button" aria-label="More" className="link-btn" style={{ width: 40, height: 40, fontSize: 20, color: 'var(--plum)' }} onClick={() => set('maxChatsPerWeek', Math.min(7, f.maxChatsPerWeek + 1))}>+</button>
          </div>
        </div>
        <ErrorBox error={error} />
        <button className="btn block" disabled={busy} style={{ fontSize: 16, padding: 14 }}>{busy ? 'Saving…' : isEdit ? 'Save my card' : 'Submit'}</button>
      </form>
      <div style={{ flex: '1 1 320px', minWidth: 0, display: 'flex', justifyContent: 'center', paddingTop: 24 }}><PersonArt /></div>
    </main>
  );
}
