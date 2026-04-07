import './EmptyState.css';

const MESSAGES = {
  notebook: {
    title: 'Nothing written yet',
    body: 'The page waits. Begin a note, a thought, a question — whatever arrives first.',
  },
  feed: {
    title: 'No reflections yet',
    body: 'The conversation hasn\'t started. Be the first to respond.',
  },
  session: {
    title: 'No sessions yet',
    body: 'A prompt will appear here when your professor opens a new conversation.',
  },
  connections: {
    title: 'No connections yet',
    body: 'When two thoughts share a tag, they can meet here.',
  },
  essay: {
    title: 'An empty canvas',
    body: 'Bring in your notes, reflections, and connections. An argument will emerge.',
  },
  search: {
    title: 'Nothing found',
    body: 'Try a different word. Sometimes the idea you\'re looking for has a different name.',
  },
  generic: {
    title: 'Nothing here yet',
    body: 'This space is waiting to be filled.',
  },
};

export default function EmptyState({
  type = 'generic',
  title: customTitle,
  body: customBody,
  action,
  className = '',
}) {
  const config = MESSAGES[type] || MESSAGES.generic;
  const displayTitle = customTitle || config.title;
  const displayBody = customBody || config.body;

  return (
    <div className={`empty-state ${className}`}>
      <div className="empty-state__ornament" aria-hidden="true">
        ❧
      </div>
      <h3 className="empty-state__title">{displayTitle}</h3>
      <p className="empty-state__body">{displayBody}</p>
      {action && (
        <div className="empty-state__action">
          {action}
        </div>
      )}
    </div>
  );
}
