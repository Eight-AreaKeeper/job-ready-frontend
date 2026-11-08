import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { ErrorBox } from '../components/ui.jsx';

/** Where to go after sign-in: students without a profile take the questionnaire, mentors without a card fill it in. */
async function landingFor(user) {
  if (user.role === 'mentor') {
    const { items } = await api.mentors();
    return items.some((m) => m.userId === user.id) ? '/mentor/dashboard' : '/mentor/signup';
  }
  try {
    await api.getProfile();
    return '/opportunities/recommended';
  } catch (e) {
    if (e.status === 404) return '/profile/setup';
    throw e;
  }
}

export default function SignIn() {
  const [params] = useSearchParams();
  const { user, ready, signIn, register } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState(params.get('tab') === 'login' ? 'login' : params.get('role') ? 'register' : 'login');
  const [role, setRole] = useState(params.get('role') === 'mentor' ? 'mentor' : 'student');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const next = params.get('next');

  if (ready && user && !busy) return <Navigate to={user.role === 'mentor' ? '/mentor/dashboard' : '/opportunities/recommended'} replace />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const u = tab === 'register'
        ? await register({ name: form.name.trim(), email: form.email.trim(), password: form.password, role })
        : await signIn(form.email.trim(), form.password);
      navigate(next && tab === 'login' ? next : await landingFor(u), { replace: true });
    } catch (err) {
      setError(err.status === 401 ? 'Wrong email or password.' : err.message);
      setBusy(false);
    }
  }

  const reg = tab === 'register';
  return (
    <main className="page" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 48, alignItems: 'center', paddingTop: 24 }}>
      <section className="stack" style={{ flex: '1 1 420px', minWidth: 0, gap: 20 }}>
        <h1 style={{ fontWeight: 600, fontSize: 52, lineHeight: 1.08, letterSpacing: -0.5 }}>Your next step<br />starts <span style={{ color: 'var(--purple)' }}>here</span></h1>
        <p className="lead" style={{ maxWidth: 460 }}>Build a career profile, find opportunities that fit you, tailor your resume and meet mentors who have been where you want to go.</p>
        <ul className="dot-list" style={{ fontSize: 16, color: 'var(--body)' }}>
          <li>Students and recent graduates</li><li>Newcomers to Canada</li><li>Professionals who want to mentor</li>
        </ul>
      </section>

      <section aria-label="Account" className="card" style={{ flex: '1 1 420px', minWidth: 0, maxWidth: 480, padding: 32, boxShadow: '0 12px 32px rgba(91, 33, 182, 0.08)' }}>
        <div role="tablist" className="tabs" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignSelf: 'stretch', marginBottom: 24 }}>
          <button type="button" role="tab" aria-selected={reg} className={reg ? 'on' : ''} onClick={() => { setTab('register'); setError(null); }}>Create account</button>
          <button type="button" role="tab" aria-selected={!reg} className={!reg ? 'on' : ''} onClick={() => { setTab('login'); setError(null); }}>Sign in</button>
        </div>
        <form className="stack" style={{ gap: 16 }} onSubmit={submit}>
          <h2 style={{ fontSize: 24, color: 'var(--plum)' }}>{reg ? 'Create your account' : 'Welcome back'}</h2>
          {reg && (
            <fieldset>
              <legend style={{ fontSize: 13 }}>I am joining as</legend>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[['student', 'Student / job seeker', 'Find jobs, build resumes'], ['mentor', 'Mentor', 'Share your experience']].map(([r, t, d]) => (
                  <button key={r} type="button" aria-pressed={role === r} onClick={() => setRole(r)}
                    style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start', textAlign: 'left', padding: 14, borderRadius: 10, cursor: 'pointer', color: 'var(--ink)', border: `2px solid ${role === r ? 'var(--purple)' : 'var(--line)'}`, background: role === r ? 'var(--tint)' : '#fff' }}>
                    <strong style={{ fontFamily: 'var(--head)', fontSize: 16 }}>{t}</strong><span style={{ fontSize: 13, color: 'var(--muted)' }}>{d}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          )}
          {reg && <label className="field" style={{ fontSize: 13 }}>Your name<input required value={form.name} onChange={set('name')} placeholder="Maya Chen" autoComplete="name" /></label>}
          <label className="field" style={{ fontSize: 13 }}>Email<input required type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" autoComplete="email" /></label>
          <label className="field" style={{ fontSize: 13 }}>Password<input required type="password" minLength={reg ? 8 : undefined} value={form.password} onChange={set('password')} placeholder={reg ? 'At least 8 characters' : ''} autoComplete={reg ? 'new-password' : 'current-password'} /></label>
          <ErrorBox error={error} />
          <button className="btn block" disabled={busy} style={{ fontSize: 16, padding: 14 }}>{busy ? 'Please wait…' : reg ? 'Create account' : 'Sign in'}</button>
          {reg && <p className="faint" style={{ textAlign: 'center' }}>{role === 'mentor' ? 'Next, you will fill in your mentor card.' : 'Next, you will answer a few questions to build your career profile.'}</p>}
        </form>
      </section>
    </main>
  );
}
