import { Link } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function ResumeBuilder() {
  const { user } = useAuth();
  const student = user?.role === 'student';
  return (
    <main className="page" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 56, alignItems: 'center', paddingTop: 40 }}>
      <div aria-hidden="true" style={{ flex: '1 1 340px', minWidth: 0, display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: 300, height: 400, border: '6px solid var(--ink)', padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ fontFamily: 'var(--head)', fontSize: 46, fontWeight: 600, letterSpacing: 1, textAlign: 'center' }}>RESUME</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <svg width="74" height="74" viewBox="0 0 74 74" fill="none" stroke="#1d1b26" strokeWidth="4"><circle cx="37" cy="37" r="33" /><circle cx="37" cy="30" r="12" /><path d="M15 61c4-11 12-16 22-16s18 5 22 16" /></svg>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}><span style={{ height: 5, background: 'var(--ink)' }} /><span style={{ height: 5, width: '70%', background: 'var(--ink)' }} /></div>
          </div>
          {[0, 1, 2, 3, 4].map((i) => <span key={i} style={{ height: 4, background: 'var(--ink)', marginTop: i === 0 ? 10 : 0 }} />)}
        </div>
      </div>
      <div className="stack" style={{ flex: '999 1 520px', minWidth: 0, gap: 36 }}>
        <section className="stack" style={{ gap: 10 }}>
          <h1 style={{ fontWeight: 600, fontSize: 32 }}>Generate a Job Specific Resume</h1>
          <ul style={{ margin: 0, paddingLeft: 22, fontSize: 18, lineHeight: 1.7, color: 'var(--body)' }}>
            <li>Choose relevant skills and experiences based on the job chosen</li><li>Offered when you click Apply on a job</li><li>Download it as a PDF</li>
          </ul>
          <Link to={user ? '/opportunities' : '/signin'} className="btn" style={{ alignSelf: 'flex-start', marginTop: 6 }}>Find a job to apply to</Link>
        </section>
        <section className="stack" style={{ gap: 10 }}>
          <h2 style={{ fontWeight: 600, fontSize: 32 }}>Suggest how to Improve your Application</h2>
          <ul style={{ margin: 0, paddingLeft: 22, fontSize: 18, lineHeight: 1.7, color: 'var(--body)' }}>
            <li>Identify missing qualifications</li><li>Suggest ways to gain experience</li><li>Improve the wording of your bullets</li>
          </ul>
          <Link to={student ? '/resumes?suggest=1' : '/signin'} className="btn outline" style={{ alignSelf: 'flex-start', marginTop: 6 }}>Get suggestions</Link>
        </section>
        {(!user || student) && <p className="notice">No profile yet? <Link to={user ? '/profile/setup' : '/signin?role=student'} style={{ color: 'var(--purple-text)', fontWeight: 600 }}>Make a profile first</Link>: every resume is written from it.</p>}
      </div>
    </main>
  );
}
