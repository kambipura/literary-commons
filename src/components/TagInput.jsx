import { useState, useRef } from 'react';
import './TagInput.css';

export default function TagInput({
  tags = [],
  onChange,
  placeholder = 'Add a tag…',
  maxTags = 10,
  className = '',
}) {
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  const addTag = (value) => {
    const tag = value.trim().toLowerCase();
    if (!tag) return;
    if (tags.includes(tag)) return;
    if (tags.length >= maxTags) return;
    onChange?.([...tags, tag]);
    setInput('');
  };

  const removeTag = (index) => {
    onChange?.(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div
      className={`tag-input ${className}`}
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((tag, i) => (
        <span key={tag} className="tag-input__tag">
          <span className="tag-input__tag-text">{tag}</span>
          <button
            type="button"
            className="tag-input__tag-remove"
            onClick={(e) => { e.stopPropagation(); removeTag(i); }}
            aria-label={`Remove tag ${tag}`}
          >
            ×
          </button>
        </span>
      ))}
      {tags.length < maxTags && (
        <input
          ref={inputRef}
          type="text"
          className="tag-input__input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(input)}
          placeholder={tags.length === 0 ? placeholder : ''}
          aria-label="Add tag"
        />
      )}
    </div>
  );
}
