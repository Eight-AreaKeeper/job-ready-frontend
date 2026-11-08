import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { ChatRow } from '../components/ChatList.jsx';
import { Avatar, ErrorBox, Loading, useLoad } from '../components/ui.jsx';
import { fmtAvailability, fmtDateTime } from '../format.js';

function startOfWeek() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

function Request({ chat, onDone }) {
  const [time, setTime] = useState(chat.proposedTimes?.[0] || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  async function act(status) {
    setBusy(true); setError(null);
    try {
      await api.updateChat(chat.id, status === 'accepted' && time ? { status, scheduledAt: time } : { status });
      onDone();
    } catch (e) { setError(e); setBusy(false); }
  }
  return (
    <article className="card stack" style={{ gap: 12 }}>
      <div className="row between"><strong style={{ fontFamily: 'var(--head)', fontSize: 17 }}>{chat.studentName}</strong><span className="status pending">PENDING</span></div>
      {chat.message && <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--body)' }}>{chat.message}</p>}
      {chat.proposedTimes?.length > 0 && (
        <fieldset className="stack" style={{ gap: 6 }}>
          <legend style={{ fontSize: 13 }}>Choose a time</legend>
          {chat.proposedTimes.map((t) => (
            <label key={t} className="row" style={{ gap: 8, fontSize: 14 }}><input type="radio" name={`t-${chat.id}`} checked={time === t} onChange={() => setTime(t)} />{fmtDateTime(t)}</label>
          ))}
        </fieldset>
      )}
      <ErrorBox error={error} />
      <div className="row">
        <button type="button" className="btn small" disabled={busy} onClick={() => act('accepted')}>Accept</button>
        <button type="button" className="btn ghost small" disabled={busy} onClick={() => act('declined')}>Decline</button>
      </div>
    </article>
  );
}

export default function MentorDashboard() {
  const { user } = useAuth();
  const data = useLoad(async () => {
    const [mentors, chats] = await Promise.all([api.mentors(), api.chats()]);
    return { card: mentors.items.find((m) => m.userId === user.id), chats: chats.items };
  }, [user.id]);
  const [error, setError] = useState(null);

  if (data.loading && !data.data) return <main className="page"><Loading /></main>;
  if (data.error) return <main className="page"><ErrorBox error={data.error} /></main>;
  const { card, chats } = data.data;
  if (!card) {
    return (
      <main className="page narrow">
        <div className="empty stack" style={{ alignItems: 'center' }}>
          <h1 style={{ fontSize: 26 }}>Welcome, {user.name.split(' ')[0]}</h1>
          <p>Fill in your mentor card so students can find you.</p>
          <Link to="/mentor/signup" className="btn">Make my mentor card</Link>
        </div>
      </main>
    );
  }
  const mine = chats.filter((c) => c.mentorId === card.id);
  const pending = mine.filter((c) => c.status === 'pending');
  const upcoming = mine.filter((c) => c.status === 'accepted');
  const past = mine.filter((c) => c.status === 'completed' || c.status === 'declined');
  const completed = mine.filter((c) => c.status === 'completed').length;
  const week = startOfWeek();
  const thisWeek = mine.filter((c) => (c.status === 'accepted' || c.status === 'completed') && c.scheduledAt && new Date(c.scheduledAt) >= week && new Date(c.scheduledAt) < new Date(week.getTime() + 7 * 86400000)).length;

  async function complete(id) {
    setError(null);
    try { await api.updateChat(id, { status: 'completed' }); data.reload(); } catch (e) { setError(e); }
  }

  return (
    <>
      <section className="band">
        <div className="band-inner row between" style={{ flexDirection: 'row' }}>
          <h1 style={{ fontSize: 36 }}>Welcome back, {user.name.split(' ')[0]}</h1>
          <div className="row">
            <div className="stat"><div className="k">Mentor points</div><div className="v">{card.points}</div></div>
            <div className="stat"><div className="k">Chats completed</div><div className="v">{completed}</div></div>
            <div className="stat"><div className="k">This week</div><div className="v">{thisWeek} / {card.maxChatsPerWeek}</div></div>
          </div>
        </div>
      </section>
      <main className="page split">
        <div className="grow stack" style={{ gap: 28 }}>
          <ErrorBox error={error} />
          <section className="stack">
            <h2 style={{ fontSize: 22 }}>New requests ({pending.length})</h2>
            {pending.length === 0 && <p className="faint">No new requests right now.</p>}
            {pending.map((c) => <Request key={c.id} chat={c} onDone={data.reload} />)}
          </section>
          <section className="stack" style={{ gap: 0 }}>
            <h2 style={{ fontSize: 22, marginBottom: 8 }}>Upcoming chats</h2>
            {upcoming.length === 0 && <p className="faint">Nothing scheduled.</p>}
            {upcoming.map((c) => (
              <ChatRow key={c.id} chat={c} other={c.studentName}>
                <button type="button" className="btn ghost small" onClick={() => complete(c.id)}>Mark completed (+10 points)</button>
              </ChatRow>
            ))}
          </section>
          {past.length > 0 && (
            <section className="stack" style={{ gap: 0 }}>
              <h2 style={{ fontSize: 22, marginBottom: 8 }}>Past chats</h2>
              {past.map((c) => <ChatRow key={c.id} chat={c} other={c.studentName} />)}
            </section>
          )}
        </div>
        <aside className="side card tint stack" style={{ gap: 10 }}>
          <h2 style={{ fontSize: 18 }}>Your mentor card</h2>
          <div className="row"><Avatar name={card.name} photo={card.photoUrl} size={52} /><div><strong>{card.name}</strong><div className="muted" style={{ fontSize: 14 }}>{[card.headline, card.company].filter(Boolean).join(' · ')}</div></div></div>
          <div style={{ fontSize: 14 }}><strong>Expertise:</strong> {card.expertise?.join(', ') || '—'}</div>
          {card.yearsExperience != null && <div style={{ fontSize: 14 }}><strong>Experience:</strong> {card.yearsExperience} years</div>}
          <div style={{ fontSize: 14 }}><strong>Available:</strong> {fmtAvailability(card.availability)}</div>
          <div style={{ fontSize: 14 }}><strong>Max chats per week:</strong> {card.maxChatsPerWeek}</div>
          <Link to="/mentor/signup" className="btn outline small" style={{ alignSelf: 'flex-start' }}>Edit my card</Link>
        </aside>
      </main>
    </>
  );
}
