import { useState, useEffect } from 'react';
import './Toast.css';

export default function Toast({
  message,
  type = 'info',     // info | success | error
  duration = 3000,
  onDismiss,
}) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => {
      setExiting(true);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration]);

  useEffect(() => {
    if (!exiting) return;
    const timer = setTimeout(() => {
      onDismiss?.();
    }, 300);
    return () => clearTimeout(timer);
  }, [exiting, onDismiss]);

  const classes = [
    'toast',
    `toast--${type}`,
    exiting && 'toast--exit',
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} role="alert">
      <span className="toast__icon">
        {type === 'success' && '✓'}
        {type === 'error' && '✗'}
        {type === 'info' && '·'}
      </span>
      <span className="toast__message">{message}</span>
      <button
        className="toast__close"
        onClick={() => setExiting(true)}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
