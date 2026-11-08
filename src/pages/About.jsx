import { Link } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

const STEPS = ['Build your career profile', 'Discover matching opportunities', 'Identify skill gaps', 'Create tailored resumes', 'Have a coffee chat with a mentor'];

export default function About() {
  const { user } = useAuth();
  return (
    <>
      <section className="band center"><div className="band-inner"><h1 style={{ fontSize: 44 }}>About Us</h1></div></section>
      <main className="page" style={{ maxWidth: 1100, gap: 40 }}>
        <section className="stack">
          <h2 style={{ fontSize: 26 }}>Our Mission</h2>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--body)', maxWidth: 860 }}>Job Ready aims to empower underrepresented job seekers by using technology to make career development more accessible. We help users create tailored resumes, identify and develop in-demand skills, and discover opportunities to build meaningful professional connections. Our goal is to help individuals navigate an evolving job market and feel more confident pursuing their career goals.</p>
        </section>
        <div className="hero" style={{ gap: 40 }}>
          <div className="stack" style={{ gap: 32 }}>
            <section className="stack">
              <h2 style={{ fontSize: 26 }}>Who We Help</h2>
              <ul className="dot-list" style={{ fontFamily: 'var(--head)', fontSize: 17 }}>
                <li>University students</li><li>Recent graduates and job seekers</li><li>Newcomers to Canada</li>
              </ul>
            </section>
            <section className="stack">
              <h2 style={{ fontSize: 26 }}>How it Works</h2>
              <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'var(--head)', fontSize: 17 }}>
                {STEPS.map((s, i) => (
                  <li key={s} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--chip)', color: 'var(--purple-text)', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>{s}
                  </li>
                ))}
              </ol>
            </section>
            <Link to={user ? '/opportunities' : '/signin'} className="btn" style={{ alignSelf: 'flex-start' }}>Get started</Link>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <img src="/about.jpg" alt="A diverse group of professionals from many fields" style={{ width: '100%', maxWidth: 480, aspectRatio: '6 / 5', objectFit: 'cover', borderRadius: '50%' }} />
          </div>
        </div>
      </main>
    </>
  );
}
