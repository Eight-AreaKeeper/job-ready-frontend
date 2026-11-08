import { Link } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { ArrowOut } from '../components/ui.jsx';

const FEATURES = [
  { to: '/profile/setup', title: 'Build your profile', text: 'Answer a few questions and AI writes your career profile.',
    icon: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6" /></> },
  { to: '/opportunities', title: 'Find opportunities', text: 'Jobs by deadline, plus career events near you.',
    icon: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></> },
  { to: '/resume', title: 'Tailor your resume', text: 'A resume for each job, plus tips to close the gaps.',
    icon: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h4" /></> },
  { to: '/mentors', title: 'Meet mentors', text: 'Book a 20-minute coffee chat with a professional.',
    icon: <><path d="M4 8h12v5a5 5 0 01-5 5H9a5 5 0 01-5-5z" /><path d="M16 9h2a2 2 0 010 4h-2M6 21h10" /></> },
];

export default function Home() {
  const { user } = useAuth();
  const startStudent = user ? (user.role === 'mentor' ? '/mentor/dashboard' : '/profile/setup') : '/signin?role=student';
  const startMentor = user ? (user.role === 'mentor' ? '/mentor/signup' : '/mentors') : '/signin?role=mentor';
  return (
    <main className="page" style={{ gap: 56, paddingTop: 24 }}>
      <section className="hero">
        <div className="stack" style={{ gap: 24, alignItems: 'flex-start' }}>
          <h1>Make your career ambitions <span style={{ color: 'var(--purple)' }}>a reality</span></h1>
          <p className="lead" style={{ maxWidth: 480 }}>Job Ready turns a few questions into a career profile, then matches you with jobs, tailors your resume and connects you with mentors.</p>
          <div className="row">
            <Link to={startStudent} className="btn" style={{ fontSize: 16, padding: '14px 24px' }}>Make a Profile <ArrowOut size={16} /></Link>
            <Link to={startMentor} className="btn outline" style={{ fontSize: 16, padding: '14px 24px' }}>Become a mentor</Link>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <img src="/hero.jpg" alt="A young professional celebrating" />
        </div>
      </section>
      <section aria-labelledby="how" className="stack" style={{ gap: 20 }}>
        <h2 id="how" style={{ fontSize: 28, textAlign: 'center' }}>How Job Ready helps</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {FEATURES.map((f) => (
            <Link key={f.title} to={user ? f.to : '/signin'} className="feature">
              <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8B3DFF" strokeWidth="1.8">{f.icon}</svg>
              <strong>{f.title}</strong><span>{f.text}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
