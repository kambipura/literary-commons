import React from 'react';
import { Link } from 'react-router-dom';
import Badge from './Badge';
import Button from './Button';

/**
 * SessionSpotlight
 * 
 * A premium header component for the Class Hub that highlights 
 * the current active session prompt for students.
 */
export default function SessionSpotlight({ session, myReflections = [], onAction }) {
  if (!session) return null;

  const hasPublished = myReflections.some(r => r.status === 'published');
  const hasDraft = myReflections.some(r => r.status === 'draft');

  return (
    <div className="session-spotlight">
      <div className="session-spotlight__background">
        <div className="session-spotlight__glow" />
      </div>
      
      <div className="session-spotlight__content">
        <div className="session-spotlight__meta">
          <Badge type="move" variant="they-say" label="Current Inquiry" />
          <span className="meta">Session {session.number}</span>
        </div>
        
        <h2 className="session-spotlight__title">{session.title}</h2>
        <p className="session-spotlight__prompt">
          “{session.theySayPrompt}”
        </p>

        <div className="session-spotlight__actions">
          {hasDraft && (
            <div className="session-spotlight__nudge">
              <span className="meta" style={{ color: 'var(--accent)' }}>You have a draft in progress.</span>
              <Link to="/write">
                <Button size="sm" variant="accent">Resume Response</Button>
              </Link>
            </div>
          )}
          
          {!hasDraft && !hasPublished && (
            <Link to="/write">
              <Button size="sm">Respond to Prompt</Button>
            </Link>
          )}

          {hasPublished && !hasDraft && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <span className="meta" style={{ color: 'var(--ink-3)' }}>✓ You've contributed to this conversation.</span>
              <Link to="/write">
                <Button size="sm" variant="ghost">Respond Again</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
