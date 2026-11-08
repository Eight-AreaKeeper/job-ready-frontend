import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { Avatar, Chip, ErrorBox, Loading } from '../components/ui.jsx';
import { INDUSTRIES } from '../format.js';

const LEVELS = ['beginner', 'student', 'intermediate', 'senior'];
const WORKPLACES = ['Startup', 'Large company', 'Research lab'];

const bullets = (text) => text.split('\n').map((s) => s.trim()).filter(Boolean);

function SectionHead({ title, onAdd }) {
  return (
    <div className="row between">
      <h3 style={{ fontSize: 20 }}>{title}</h3>
      {onAdd && <button type="button" className="link-btn" style={{ color: 'var(--purple-text)', fontWeight: 600 }} onClick={onAdd}>+ Add</button>}
    </div>
  );
}

/** One editable entry (education, experience or project) with a remove button. */
function Entry({ fields, value, onChange, onRemove, label }) {
  return (
    <div className="card" style={{ padding: 16, display: 'grid', gap: 10 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
        {fields.map(([k, l]) => (
          <label key={k} className="field" style={{ fontSize: 12 }}>{l}
            <input value={value[k] || ''} onChange={(e) => onChange({ ...value, [k]: e.target.value })} />
          </label>
        ))}
      </div>
      {'bullets' in value && (
        <label className="field" style={{ fontSize: 12 }}>Bullet points <span className="hint">one per line</span>
          <textarea rows={3} value={(value.bullets || []).join('\n')} onChange={(e) => onChange({ ...value, bullets: e.target.value.split('\n') })} />
        </label>
      )}
      <button type="button" className="link-btn" style={{ justifySelf: 'start', color: 'var(--err)' }} onClick={onRemove} aria-label={`Remove ${label}`}>Remove</button>
    </div>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orig, setOrig] = useState(null);
  const [p, setP] = useState(null);
  const [error, setError] = useState(null);
  const [missing, setMissing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [addingIndustry, setAddingIndustry] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    api.getProfile().then((d) => { setOrig(d); setP(d); }).catch((e) => (e.status === 404 ? setMissing(true) : setError(e)));
  }, []);

  if (missing) {
    return (
      <main className="page narrow">
        <div className="empty stack" style={{ alignItems: 'center' }}>
          <h1 style={{ fontSize: 26 }}>You do not have a career profile yet</h1>
          <p>Answer a few questions and AI builds it for you.</p>
          <Link to="/profile/setup" className="btn">Make a Profile</Link>
        </div>
      </main>
    );
  }
  if (!p) return <main className="page">{error ? <ErrorBox error={error} /> : <Loading />}</main>;

  const set = (k, v) => { setP({ ...p, [k]: v }); setSaved(false); };
  const list = (k) => p[k] || [];
  const update = (k, i, v) => set(k, list(k).map((x, j) => (j === i ? v : x)));
  const remove = (k, i) => set(k, list(k).filter((_, j) => j !== i));
  const addSkill = () => {
    const s = newSkill.trim();
    if (s && !list('skills').some((x) => x.toLowerCase() === s.toLowerCase())) set('skills', [...list('skills'), s]);
    setNewSkill('');
  };

  async function save() {
    setSaving(true);
    setError(null);
    const clean = (arr) => arr.map((x) => (x.bullets ? { ...x, bullets: bullets(x.bullets.join('\n')) } : x));
    try {
      const body = {
        summary: p.summary, skills: list('skills'), industries: list('industries'), location: p.location,
        experienceLevel: p.experienceLevel, preferredWorkType: p.preferredWorkType,
        education: list('education'), experience: clean(list('experience')), projects: clean(list('projects')),
      };
      const d = await api.updateProfile(body);
      setOrig(d); setP(d); setSaved(true);
    } catch (e) { setError(e); }
    setSaving(false);
  }

  async function generate() {
    setGenerating(true);
    setError(null);
    try {
      const r = await api.generateResume();
      navigate(`/resumes?id=${r.id}`);
    } catch (e) { setError(e); setGenerating(false); }
  }

  return (
    <>
      <section className="band">
        <div className="band-inner row between" style={{ flexDirection: 'row' }}>
          <div>
            <h1 style={{ fontSize: 36 }}>My career profile</h1>
            <p style={{ marginTop: 6, color: 'var(--body)' }}>Built by AI from your answers. Check it and fix anything that is wrong.</p>
          </div>
          <div className="row">
            <Link to="/profile/setup" className="btn outline">Retake questionnaire</Link>
            <button type="button" className="btn" onClick={generate} disabled={generating}>{generating ? 'Writing your resume…' : 'Generate my resume'}</button>
          </div>
        </div>
      </section>
      <main className="page split">
        <aside className="side card stack" style={{ gap: 18 }}>
          <div className="row"><Avatar name={user.name} size={56} /><div><h2 style={{ fontSize: 20 }}>{user.name}</h2><p className="faint">{user.email}</p></div></div>
          <label className="field">Location<input value={p.location || ''} onChange={(e) => set('location', e.target.value)} /></label>
          <fieldset>
            <legend>Experience level</legend>
            <div className="chips" role="radiogroup">
              {LEVELS.map((l) => <Chip key={l} on={p.experienceLevel === l} onClick={() => set('experienceLevel', l)}>{l[0].toUpperCase() + l.slice(1)}</Chip>)}
            </div>
          </fieldset>
          <fieldset>
            <legend>Preferred workplace</legend>
            <div className="chips">
              {WORKPLACES.map((w) => <Chip key={w} on={p.preferredWorkType === w} onClick={() => set('preferredWorkType', w)}>{w}</Chip>)}
            </div>
          </fieldset>
          <fieldset>
            <legend>Industries (up to 3)</legend>
            <div className="chips">
              {list('industries').map((i) => <span key={i} className="tag big">{i}<button type="button" aria-label={`Remove ${i}`} onClick={() => set('industries', list('industries').filter((x) => x !== i))}>×</button></span>)}
              {list('industries').length < 3 && (addingIndustry ? (
                <select className="input" aria-label="Add an industry" autoFocus defaultValue="" onChange={(e) => { if (e.target.value) set('industries', [...list('industries'), e.target.value]); setAddingIndustry(false); }} onBlur={() => setAddingIndustry(false)}>
                  <option value="">Choose…</option>
                  {INDUSTRIES.filter((i) => !list('industries').includes(i)).map((i) => <option key={i}>{i}</option>)}
                </select>
              ) : <button type="button" className="chip" onClick={() => setAddingIndustry(true)}>+ Add</button>)}
            </div>
          </fieldset>
        </aside>

        <div className="grow stack" style={{ gap: 28 }}>
          <section className="stack">
            <h3 style={{ fontSize: 20 }}>Summary</h3>
            <label className="field"><span className="sr-only">Summary</span><textarea rows={4} value={p.summary || ''} onChange={(e) => set('summary', e.target.value)} /></label>
          </section>
          <section className="stack">
            <h3 style={{ fontSize: 20 }}>Skills</h3>
            <div className="chips" style={{ alignItems: 'center' }}>
              {list('skills').map((s) => <span key={s} className="tag big">{s}<button type="button" aria-label={`Remove ${s}`} onClick={() => remove('skills', list('skills').indexOf(s))}>×</button></span>)}
              <label><span className="sr-only">Add a skill</span>
                <input className="input" style={{ padding: '7px 12px', fontSize: 14 }} value={newSkill} placeholder="Add a skill and press Enter" onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} />
              </label>
            </div>
          </section>
          <section className="stack">
            <SectionHead title="Education" onAdd={() => set('education', [...list('education'), { school: '', degree: '', end: '' }])} />
            {list('education').map((e, i) => <Entry key={i} label={`education ${i + 1}`} value={e} fields={[['school', 'School'], ['degree', 'Degree'], ['end', 'Graduating']]} onChange={(v) => update('education', i, v)} onRemove={() => remove('education', i)} />)}
          </section>
          <section className="stack">
            <SectionHead title="Experience" onAdd={() => set('experience', [...list('experience'), { title: '', org: '', start: '', end: '', bullets: [] }])} />
            {list('experience').map((e, i) => <Entry key={i} label={`experience ${i + 1}`} value={{ bullets: [], ...e }} fields={[['title', 'Title'], ['org', 'Organization'], ['start', 'Start (YYYY-MM)'], ['end', 'End (YYYY-MM)']]} onChange={(v) => update('experience', i, v)} onRemove={() => remove('experience', i)} />)}
          </section>
          <section className="stack">
            <SectionHead title="Projects" onAdd={() => set('projects', [...list('projects'), { name: '', bullets: [] }])} />
            {list('projects').map((e, i) => <Entry key={i} label={`project ${i + 1}`} value={{ bullets: [], ...e }} fields={[['name', 'Project name']]} onChange={(v) => update('projects', i, v)} onRemove={() => remove('projects', i)} />)}
          </section>
          <ErrorBox error={error} />
          {saved && <p className="success" role="status">Saved.</p>}
          <div className="row end">
            <button type="button" className="btn ghost" onClick={() => { setP(orig); setSaved(false); }}>Discard</button>
            <button type="button" className="btn" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
          </div>
        </div>
      </main>
    </>
  );
}
