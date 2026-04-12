import { useState, useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import Badge from './Badge';
import './FluidEditor.css';

// Auto-resizing textarea
const BlockTextarea = forwardRef(({ value, onChange, onKeyDown, onFocus, placeholder }, ref) => {
  const internalRef = useRef(null);

  useImperativeHandle(ref, () => internalRef.current);

  useEffect(() => {
    if (internalRef.current) {
      internalRef.current.style.height = 'auto';
      internalRef.current.style.height = internalRef.current.scrollHeight + 'px';
    }
  }, [value]);

  return (
    <textarea
      ref={internalRef}
      className="fluid-block__textarea"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      placeholder={placeholder}
      rows={1}
    />
  );
});

// ── Formatting helpers ─────────────────────────────────────
const FORMATS = [
  { key: 'bold',      label: 'B',  title: 'Bold (Ctrl+B)',      wrap: ['**', '**']   },
  { key: 'italic',    label: 'I',  title: 'Italic (Ctrl+I)',    wrap: ['*', '*']     },
  { key: 'quote',     label: '❝',  title: 'Blockquote',         prefix: '> '         },
  { key: 'heading',   label: 'H',  title: 'Heading',            prefix: '## '        },
];

function applyFormat(text, selStart, selEnd, format) {
  const selected = text.slice(selStart, selEnd);
  const before   = text.slice(0, selStart);
  const after    = text.slice(selEnd);

  if (format.wrap) {
    const [open, close] = format.wrap;
    // Toggle: if already wrapped, unwrap
    if (selected.startsWith(open) && selected.endsWith(close)) {
      const inner = selected.slice(open.length, selected.length - close.length);
      return { text: before + inner + after, cursorStart: selStart, cursorEnd: selStart + inner.length };
    }
    const newText = before + open + selected + close + after;
    return { text: newText, cursorStart: selStart + open.length, cursorEnd: selEnd + open.length };
  }

  if (format.prefix) {
    // Apply to whole line: find line boundaries
    const lineStart = text.lastIndexOf('\n', selStart - 1) + 1;
    const lineText  = text.slice(lineStart);
    const lineEnd   = lineText.indexOf('\n');
    const line      = lineEnd === -1 ? lineText : lineText.slice(0, lineEnd);

    // Toggle prefix
    if (line.startsWith(format.prefix)) {
      const stripped = text.slice(0, lineStart) + line.slice(format.prefix.length) + text.slice(lineStart + line.length);
      return { text: stripped, cursorStart: selStart - format.prefix.length, cursorEnd: selEnd - format.prefix.length };
    }
    const newText = text.slice(0, lineStart) + format.prefix + text.slice(lineStart);
    return { text: newText, cursorStart: selStart + format.prefix.length, cursorEnd: selEnd + format.prefix.length };
  }

  return { text, cursorStart: selStart, cursorEnd: selEnd };
}

// ── Markdown renderer for read contexts ────────────────────
export function renderMarkdown(text) {
  if (!text) return null;

  return text.split('\n').map((line, i) => {
    // Blockquote
    if (line.startsWith('> ')) {
      return (
        <blockquote key={i} style={{
          borderLeft: '3px solid var(--paper-3)',
          paddingLeft: 'var(--space-4)',
          margin: '0 0 var(--space-2) 0',
          color: 'var(--ink-2)',
          fontStyle: 'italic'
        }}>
          {renderInline(line.slice(2))}
        </blockquote>
      );
    }
    // Headings
    if (line.startsWith('## ')) {
      return <h3 key={i} style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: 'var(--space-2)', marginTop: 'var(--space-4)' }}>{renderInline(line.slice(3))}</h3>;
    }
    if (line.startsWith('# ')) {
      return <h2 key={i} style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: 'var(--space-3)', marginTop: 'var(--space-4)' }}>{renderInline(line.slice(2))}</h2>;
    }
    // Empty line
    if (!line.trim()) return <br key={i} />;
    // Regular paragraph line
    return <span key={i} style={{ display: 'block', marginBottom: 'var(--space-1)' }}>{renderInline(line)}</span>;
  });
}

function renderInline(text) {
  // Process bold (**text**) and italic (*text*)
  const parts = [];
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[0].startsWith('**')) {
      parts.push(<strong key={m.index}>{m[2]}</strong>);
    } else {
      parts.push(<em key={m.index}>{m[3]}</em>);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : text;
}

// ── FluidEditor ────────────────────────────────────────────
export default function FluidEditor({ blocks, onChange, placeholder = 'Start writing...' }) {
  const [activeToolbar, setActiveToolbar] = useState(null);
  const [activeBlockIndex, setActiveBlockIndex] = useState(null);
  const refs = useRef({});

  const generateId = () => `blk-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  useEffect(() => {
    if (blocks.length === 0) {
      onChange([{ id: generateId(), text: '', moveType: null }]);
    }
  }, [blocks, onChange]);

  const updateBlock = (index, updates) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], ...updates };
    onChange(newBlocks);
  };

  const handleKeyDown = (e, index) => {
    const block = blocks[index];
    const el = e.target;

    // Keyboard shortcuts for formatting
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      handleFormat(index, FORMATS.find(f => f.key === 'bold'));
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      handleFormat(index, FORMATS.find(f => f.key === 'italic'));
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const cursor = el.selectionStart;
      const textBefore = block.text.slice(0, cursor);
      const textAfter  = block.text.slice(cursor);
      const newBlocks  = [...blocks];
      newBlocks[index] = { ...block, text: textBefore };
      const newBlockId = generateId();
      newBlocks.splice(index + 1, 0, { id: newBlockId, text: textAfter, moveType: null });
      onChange(newBlocks);
      setTimeout(() => { if (refs.current[newBlockId]) refs.current[newBlockId].focus(); }, 0);
    }
    else if (e.key === 'Backspace' && block.text === '' && blocks.length > 1) {
      e.preventDefault();
      const newBlocks = [...blocks];
      newBlocks.splice(index, 1);
      onChange(newBlocks);
      const prevBlockId = blocks[index - 1]?.id;
      setTimeout(() => {
        if (refs.current[prevBlockId]) {
          const el = refs.current[prevBlockId];
          el.focus();
          el.setSelectionRange(el.value.length, el.value.length);
        }
      }, 0);
    }
    else if (e.key === 'Backspace' && el.selectionStart === 0 && el.selectionEnd === 0 && index > 0) {
      e.preventDefault();
      const prevBlock    = blocks[index - 1];
      const newCursorPos = prevBlock.text.length;
      const newBlocks    = [...blocks];
      newBlocks[index - 1] = { ...prevBlock, text: prevBlock.text + block.text };
      newBlocks.splice(index, 1);
      onChange(newBlocks);
      setTimeout(() => {
        if (refs.current[prevBlock.id]) {
          const el = refs.current[prevBlock.id];
          el.focus();
          el.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    }
    else if (e.key === 'ArrowUp' && el.selectionStart === 0 && index > 0) {
      e.preventDefault();
      refs.current[blocks[index - 1].id]?.focus();
    }
    else if (e.key === 'ArrowDown' && el.selectionStart === block.text.length && index < blocks.length - 1) {
      e.preventDefault();
      refs.current[blocks[index + 1].id]?.focus();
    }
  };

  const handleFormat = (index, format) => {
    const el = refs.current[blocks[index].id];
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const { text: newText, cursorStart, cursorEnd } = applyFormat(blocks[index].text, s, e, format);
    updateBlock(index, { text: newText });
    setTimeout(() => {
      if (refs.current[blocks[index].id]) {
        refs.current[blocks[index].id].focus();
        refs.current[blocks[index].id].setSelectionRange(cursorStart, cursorEnd);
      }
    }, 0);
  };

  const handleTagChange = (index, type) => {
    updateBlock(index, { moveType: type });
    setActiveToolbar(null);
  };

  useEffect(() => {
    const clickHandler = () => setActiveToolbar(null);
    if (activeToolbar) document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, [activeToolbar]);

  if (blocks.length === 0) return null;

  return (
    <div className="fluid-editor">
      {/* ── Formatting toolbar ── */}
      <div className="fluid-format-bar">
        {FORMATS.map(fmt => (
          <button
            key={fmt.key}
            className={`fluid-format-btn fluid-format-btn--${fmt.key}`}
            title={fmt.title}
            onMouseDown={e => {
              e.preventDefault(); // don't blur textarea
              if (activeBlockIndex !== null) {
                handleFormat(activeBlockIndex, fmt);
              }
            }}
          >
            {fmt.label}
          </button>
        ))}
        <span className="fluid-format-bar__hint">Select text then click to format · Ctrl+B bold · Ctrl+I italic</span>
      </div>

      {blocks.map((block, index) => (
        <div key={block.id} className="fluid-block">
          {/* Rhetorical move gutter */}
          <div
            className="fluid-block__gutter"
            onClick={e => {
              e.stopPropagation();
              setActiveToolbar(activeToolbar === block.id ? null : block.id);
            }}
          >
            <div className="fluid-block__gutter-icon" title="Tag paragraph">⋮⋮</div>
            {activeToolbar === block.id && (
              <div className="fluid-toolbar" onClick={e => e.stopPropagation()}>
                <div className="fluid-toolbar__title">Assign Move</div>
                <button className="fluid-toolbar__btn" onClick={() => handleTagChange(index, 'they-say')}>
                  <Badge type="move" variant="they-say" size="sm" /> They Say
                </button>
                <button className="fluid-toolbar__btn" onClick={() => handleTagChange(index, 'i-say')}>
                  <Badge type="move" variant="i-say" size="sm" /> I Say
                </button>
                <button className="fluid-toolbar__btn" onClick={() => handleTagChange(index, 'so-what')}>
                  <Badge type="move" variant="so-what" size="sm" /> So What
                </button>
                <div style={{ height: '1px', background: 'var(--paper-3)', margin: 'var(--space-2) 0' }} />
                <button className="fluid-toolbar__btn" onClick={() => handleTagChange(index, 'evidence')}>
                  <Badge type="move" variant="evidence" size="sm" /> Evidence
                </button>
                <button className="fluid-toolbar__btn" onClick={() => handleTagChange(index, 'naysayer')}>
                  <Badge type="move" variant="naysayer" size="sm" /> Naysayer
                </button>
                <button className="fluid-toolbar__btn" onClick={() => handleTagChange(index, 'context')}>
                  <Badge type="move" variant="context" size="sm" /> Context
                </button>
                <div style={{ height: '1px', background: 'var(--paper-3)', margin: 'var(--space-2) 0' }} />
                <button className="fluid-toolbar__btn fluid-toolbar__btn--none" onClick={() => handleTagChange(index, null)}>
                  ✕ Clear tag
                </button>
              </div>
            )}
          </div>

          <div className="fluid-block__content">
            {block.moveType && (
              <div className={`fluid-block__indicator fluid-block__indicator--${block.moveType}`} title={block.moveType} />
            )}
            <BlockTextarea
              ref={el => refs.current[block.id] = el}
              value={block.text}
              placeholder={index === 0 ? placeholder : 'Continue writing…'}
              onChange={e => updateBlock(index, { text: e.target.value })}
              onKeyDown={e => handleKeyDown(e, index)}
              onFocus={() => {
                setActiveBlockIndex(index);
                if (activeToolbar) setActiveToolbar(null);
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
