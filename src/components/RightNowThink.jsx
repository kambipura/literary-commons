import { useState, useEffect, useRef } from 'react';
import './RightNowThink.css';

export default function RightNowThink({
  value = '',
  onChange,
  className = '',
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const save = () => {
    setEditing(false);
    if (draft.trim() !== value) {
      onChange?.(draft.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      save();
    }
    if (e.key === 'Escape') {
      setDraft(value);
      setEditing(false);
    }
  };

  return (
    <div className={`right-now ${className}`}>
      <span className="right-now__label">Right now, I think</span>
      {editing ? (
        <input
          ref={inputRef}
          type="text"
          className="right-now__input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={handleKeyDown}
          placeholder="..."
          aria-label="Right now I think"
          maxLength={200}
        />
      ) : (
        <button
          className="right-now__display"
          onClick={() => setEditing(true)}
          title="Click to edit your current position"
        >
          {value || (
            <span className="right-now__placeholder">
              ...click to write your current position
            </span>
          )}
        </button>
      )}
    </div>
  );
}
