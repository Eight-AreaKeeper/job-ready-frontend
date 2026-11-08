import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { ChatRow } from '../components/ChatList.jsx';
import { Avatar, Chip, ErrorBox, Loading, Sparkle, useLoad } from '../components/ui.jsx';
import { fmtDateTime, upcomingSlotTimes } from '../format.js';
import { MentorFacts } from './Mentors.jsx';

export default function CoffeeChat() {
  const { id } = useParams();
  const mentors = useLoad(() => api.mentors(), []);
  const chats = useLoad(() => api.chats(), []);
  const mentor = mentors.data?.items.find((m) => m.id === id);
  const [message, setMessage] = useState('');
  const [drafting, setDrafting] = useState(false);
  const [picked, setPicked] = useState([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  async function draft() {
    setDrafting(true); setError(null);
    try { setMessage((await api.icebreaker(id)).message); } catch (e) { setError(e); }
    setDrafting(false);
  }
  // Draft a first message with AI as soon as the page opens.
  useEffect(() => { draft(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  const slots = mentor ? upcomingSlotTimes(mentor.availability, 4) : [];
  const toggle = (t) => setPicked((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));

  async function send(e) {
    e.preventDefault();
    setSending(true); setError(null);
    try {
      await api.requestChat({ mentorId: id, message: message.trim() || undefined, proposedTimes: picked });
      setSent(true); setPicked([]); chats.reload();
    } catch (err) { setError(err); }
    setSending(false);
  }

  async function complete(chatId) {
    setError(null);
    try { await api.updateChat(chatId, { status: 'completed' }); chats.reload(); } catch (e) { setError(e); }
  }

  if (mentors.loading) return <main className="page"><Loading /></main>;
  if (!mentor) return <main className="page"><ErrorBox error={mentors.error || 'Mentor not found.'} /><Link to="/mentors">← Back to mentors</Link></main>;
  const first = mentor.name.split(' ')[0];

  return (
    <main className="page" style={{ maxWidth: 1100, gap: 20 }}>
      <Link to="/mentors" style={{ fontSize: 14, color: 'var(--plum)', fontWeight: 600 }}>← Back to mentors</Link>
      <h1 style={{ fontSize: 34 }}>Request a coffee chat</h1>
      <div className="split">
        <aside className="side card tint stack" style={{ gap: 10 }}>
          <div className="row"><Avatar name={mentor.name} photo={mentor.photoUrl} size={72} /><div><h2 style={{ fontSize: 20 }}>{mentor.name}</h2><p className="muted" style={{ fontSize: 14 }}>{[mentor.headline, mentor.company].filter(Boolean).join(' · ')}</p></div></div>
          <MentorFacts m={mentor} />
          {mentor.industries?.length > 0 && <div style={{ fontSize: 14 }}><strong>Industries:</strong> {mentor.industries.join(', ')}</div>}
          <div className="row" style={{ gap: 6, fontSize: 14 }}><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B3DFF" strokeWidth="2"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" /></svg>{mentor.points} mentor points</div>
        </aside>
        <form className="grow card stack" style={{ gap: 18 }} onSubmit={send}>
          <div className="stack" style={{ gap: 6 }}>
            <div className="row between">
              <label htmlFor="msg" style={{ fontSize: 14, fontWeight: 600, color: 'var(--plum)' }}>Your message</label>
              <button type="button" className="link-btn row" style={{ gap: 6, color: 'var(--purple-text)', fontWeight: 600 }} onClick={draft} disabled={drafting}><Sparkle size={16} width={1.8} />{drafting ? 'Writing…' : 'Write it again with AI'}</button>
            </div>
            <textarea id="msg" className="input" rows={7} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={drafting ? 'AI is drafting a message…' : 'Say who you are and what you would like to ask.'} style={{ lineHeight: 1.6 }} />
            <span className="faint">Drafted by AI. Edit it so it sounds like you.</span>
          </div>
          <fieldset>
            <legend>Pick times that work for you ({first}'s availability)</legend>
            {slots.length ? <div className="chips">{slots.map((t) => <Chip key={t} on={picked.includes(t)} onClick={() => toggle(t)}>{fmtDateTime(t)}</Chip>)}</div>
              : <p className="faint">{first} has not set any times yet. Send the request and agree on a time together.</p>}
          </fieldset>
          <ErrorBox error={error} />
          {sent && <p className="success" role="status">Request sent. You will see it below until {first} replies.</p>}
          <div className="row">
            <button className="btn" disabled={sending}>{sending ? 'Sending…' : 'Send request'}</button>
            <Link to="/mentors" className="btn ghost">Cancel</Link>
          </div>
        </form>
      </div>
      <section className="stack" style={{ gap: 0, marginTop: 12 }}>
        <h2 style={{ fontSize: 22, marginBottom: 8 }}>My coffee chats</h2>
        {chats.loading && !chats.data && <Loading />}
        {chats.data?.items.length === 0 && <p className="faint">No coffee chats yet.</p>}
        {chats.data?.items.map((c) => (
          <ChatRow key={c.id} chat={c} other={c.mentorName}>
            {c.status === 'accepted' && <button type="button" className="btn ghost small" onClick={() => complete(c.id)}>Mark as completed</button>}
          </ChatRow>
        ))}
      </section>
    </main>
  );
}
