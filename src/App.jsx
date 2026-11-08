import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import Header from './components/Header.jsx';
import { Loading } from './components/ui.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import SignIn from './pages/SignIn.jsx';
import ProfileSetup from './pages/ProfileSetup.jsx';
import Profile from './pages/Profile.jsx';
import Opportunities from './pages/Opportunities.jsx';
import Matches from './pages/Matches.jsx';
import OpportunityDetail from './pages/OpportunityDetail.jsx';
import Apply from './pages/Apply.jsx';
import Events from './pages/Events.jsx';
import ResumeBuilder from './pages/ResumeBuilder.jsx';
import Resumes from './pages/Resumes.jsx';
import Interview from './pages/Interview.jsx';
import Mentors from './pages/Mentors.jsx';
import CoffeeChat from './pages/CoffeeChat.jsx';
import MentorSignup from './pages/MentorSignup.jsx';
import MentorDashboard from './pages/MentorDashboard.jsx';

/** Pages for job seekers: open to visitors and students, mentors go to their dashboard. */
function NotMentor({ children }) {
  const { user } = useAuth();
  return user?.role === 'mentor' ? <Navigate to="/mentor/dashboard" replace /> : children;
}

/** Only signed-in users (optionally with one role) can open the page; others go to sign in. */
function Private({ role, children }) {
  const { user, ready } = useAuth();
  const loc = useLocation();
  if (!ready) return <div className="page"><Loading /></div>;
  if (!user) return <Navigate to={`/signin?next=${encodeURIComponent(loc.pathname + loc.search)}`} replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'mentor' ? '/mentor/dashboard' : '/opportunities/recommended'} replace />;
  }
  return children;
}

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/profile/setup" element={<Private role="student"><ProfileSetup /></Private>} />
        <Route path="/profile" element={<Private role="student"><Profile /></Private>} />
        <Route path="/opportunities" element={<Private role="student"><Opportunities /></Private>} />
        <Route path="/opportunities/recommended" element={<Private role="student"><Matches /></Private>} />
        <Route path="/opportunities/:id" element={<Private role="student"><OpportunityDetail /></Private>} />
        <Route path="/opportunities/:id/apply" element={<Private role="student"><Apply /></Private>} />
        <Route path="/events" element={<Private><Events /></Private>} />
        <Route path="/resume" element={<NotMentor><ResumeBuilder /></NotMentor>} />
        <Route path="/resumes" element={<Private role="student"><Resumes /></Private>} />
        <Route path="/interview" element={<Private role="student"><Interview /></Private>} />
        <Route path="/mentors" element={<Private role="student"><Mentors /></Private>} />
        <Route path="/mentors/:id/chat" element={<Private role="student"><CoffeeChat /></Private>} />
        <Route path="/mentor/signup" element={<Private role="mentor"><MentorSignup /></Private>} />
        <Route path="/mentor/dashboard" element={<Private role="mentor"><MentorDashboard /></Private>} />
        <Route path="*" element={<div className="page"><h1>Page not found</h1><p className="muted">Check the address, or use the menu above.</p></div>} />
      </Routes>
    </>
  );
}
