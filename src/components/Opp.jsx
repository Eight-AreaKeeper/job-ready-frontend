import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { cap, fmtDate } from '../format.js';
import { ArrowOut } from './ui.jsx';

/** Big band with the Job opportunities / Events switch. */
export function OppBand({ active }) {
  return (
    <section className="band center">
      <div className="band-inner">
        <h1>Opportunities waiting for you</h1>
        <div role="tablist" aria-label="Kind of opportunity" className="switch">
          <Link role="tab" aria-selected={active === 'jobs'} className={active === 'jobs' ? 'on' : ''} to="/opportunities">Job opportunities</Link>
          <Link role="tab" aria-selected={active === 'events'} className={active === 'events' ? 'on' : ''} to="/events">Events</Link>
        </div>
      </div>
    </section>
  );
}

/** Browse all / Recommended for you (students only). */
export function JobTabs() {
  const { user } = useAuth();
  if (user?.role !== 'student') return null;
  return (
    <div role="tablist" className="tabs">
      <NavLink end role="tab" to="/opportunities" className={({ isActive }) => (isActive ? 'on' : '')}>Browse all</NavLink>
      <NavLink role="tab" to="/opportunities/recommended" className={({ isActive }) => (isActive ? 'on' : '')}>Recommended for you</NavLink>
    </div>
  );
}

export function OppTags({ o }) {
  return (
    <div className="chips" style={{ gap: 6 }}>
      <span className="tag">{cap(o.type)}</span>
      <span className="tag">{cap(o.scope)}</span>
      {o.industry && <span className="tag">{o.industry}</span>}
    </div>
  );
}

/** View details + Apply buttons. Apply is only for students. */
export function OppActions({ o, match }) {
  const { user } = useAuth();
  return (
    <div className="opp-side">
      <span className="faint">Due <strong style={{ color: 'var(--ink)' }}>{fmtDate(o.deadline, { month: 'short', day: 'numeric', year: 'numeric' })}</strong></span>
      <Link to={`/opportunities/${o.id}`} state={match ? { match } : undefined} className="btn ghost small">View details</Link>
      {user?.role === 'student' && <Link to={`/opportunities/${o.id}/apply`} className="btn small">Apply <ArrowOut /></Link>}
    </div>
  );
}
