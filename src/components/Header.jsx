import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { Avatar, Sparkle } from './ui.jsx';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const meLink = user && (user.role === 'mentor' ? '/mentor/dashboard' : '/profile');
  return (
    <header className="site-header">
      <Link to="/" className="logo" aria-label="Job Ready home">Job <span>Ready</span><Sparkle /></Link>
      <nav aria-label="Main" className="main-nav">
        <NavLink to="/about">About us</NavLink>
        <NavLink to="/resume" className={({ isActive }) => (isActive || location.pathname.startsWith('/resumes') ? 'active' : '')}>Resume</NavLink>
        <NavLink to="/opportunities" className={({ isActive }) => (isActive || location.pathname.startsWith('/events') ? 'active' : '')}>Opportunities</NavLink>
        <NavLink to="/mentors" className={({ isActive }) => (isActive || location.pathname.startsWith('/mentor') ? 'active' : '')}>Mentors</NavLink>
      </nav>
      {user ? (
        <div className="header-user">
          <Link to={meLink} className="me-link" aria-label={user.role === 'mentor' ? 'Mentor dashboard' : 'My profile'}>
            <Avatar name={user.name} />{user.name.split(' ')[0]}
          </Link>
          <button type="button" className="link-btn" onClick={() => { logout(); navigate('/'); }}>Sign out</button>
        </div>
      ) : (
        <Link to="/signin" style={{ fontFamily: 'var(--head)', fontSize: 15, fontWeight: 600, color: 'var(--plum)' }}>Sign in</Link>
      )}
    </header>
  );
}
