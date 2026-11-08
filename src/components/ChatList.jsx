import { fmtDateTime } from '../format.js';

/** Status badge + who + when, used by students and mentors. */
export function ChatRow({ chat, other, children }) {
  const when = chat.status === 'accepted' || chat.status === 'completed'
    ? (chat.scheduledAt ? fmtDateTime(chat.scheduledAt) : 'Time to be confirmed')
    : chat.status === 'pending' ? 'Waiting for reply' : 'Declined';
  return (
    <div className="row" style={{ padding: '14px 0', borderTop: '1.5px solid var(--line-soft)', gap: 14 }}>
      <span className={`status ${chat.status}`}>{chat.status.toUpperCase()}</span>
      <strong style={{ fontFamily: 'var(--head)' }}>{other}</strong>
      <span className="faint" style={{ flex: 1 }}>{when}</span>
      {children}
    </div>
  );
}
