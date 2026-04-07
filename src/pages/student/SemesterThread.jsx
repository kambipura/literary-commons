import { Link } from 'react-router-dom';
import Badge from '../../components/Badge';
import {
  reflections, notes, sessions, currentUserId,
  getTheySayLabel, formatDate,
} from '../../data/mock';
import './StudentPages.css';

export default function SemesterThread() {
  // Combine reflections and notes by the current user, sorted chronologically
  const myReflections = reflections
    .filter(r => r.userId === currentUserId)
    .map(r => ({
      ...r,
      entryType: 'reflection',
      dateKey: r.createdAt,
      source: getTheySayLabel(r.theySaySource),
      firstLine: r.content?.split('\n')[0]?.slice(0, 120),
    }));

  const myNotes = notes
    .filter(n => n.userId === currentUserId && !n.isArchived)
    .map(n => ({
      ...n,
      entryType: 'note',
      dateKey: n.createdAt,
      source: '',
      firstLine: (n.content || n.iSay || n.response || n.whySaved || '')?.split('\n')[0]?.slice(0, 120),
    }));

  const timeline = [...myReflections, ...myNotes]
    .sort((a, b) => new Date(a.dateKey) - new Date(b.dateKey));

  const getSession = (sessionId) => sessions.find(s => s.id === sessionId);

  return (
    <div className="thread">
      <div className="thread__header">
        <h2>My Semester Thread</h2>
        <p className="thread__subtitle">
          Everything you've written this semester, in the order you thought it.
        </p>
      </div>

      <div className="thread__timeline">
        {timeline.map((entry, i) => {
          const session = getSession(entry.sessionId);
          return (
            <div
              key={entry.id}
              className="thread__entry"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="thread__entry-dot" />
              <div className="thread__entry-date">{formatDate(entry.dateKey)}</div>
              {session && (
                <div className="thread__entry-session">
                  Session {session.number}: {session.title}
                </div>
              )}
              {entry.source && (
                <div className="thread__entry-source">{entry.source}</div>
              )}
              <Link
                to={entry.entryType === 'reflection' ? `/post/${entry.id}` : `/notebook/${entry.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <h4 className="thread__entry-title">{entry.title}</h4>
              </Link>
              <p className="thread__entry-position">{entry.firstLine}…</p>
              <div className="thread__entry-type">
                {entry.entryType === 'reflection' ? (
                  <Badge type="custom" label={entry.status === 'draft' ? 'Draft' : 'Published'} size="sm" />
                ) : (
                  <Badge type="note" variant={entry.type} size="sm" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
