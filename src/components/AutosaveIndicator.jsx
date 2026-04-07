import { useState, useEffect } from 'react';
import './AutosaveIndicator.css';

export default function AutosaveIndicator({
  status = 'idle',    // idle | saving | saved | error
  className = '',
}) {
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (status === 'saved') {
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  if (status === 'idle' && !showSaved) return null;

  return (
    <div className={`autosave ${className}`} aria-live="polite">
      {status === 'saving' && (
        <span className="autosave__saving">
          <span className="autosave__drop" />
          <span className="autosave__text">Saving</span>
        </span>
      )}
      {(status === 'saved' || showSaved) && (
        <span className="autosave__saved">
          <span className="autosave__check">✓</span>
          <span className="autosave__text">Saved</span>
        </span>
      )}
      {status === 'error' && (
        <span className="autosave__error">
          <span className="autosave__text">Not saved</span>
        </span>
      )}
    </div>
  );
}
