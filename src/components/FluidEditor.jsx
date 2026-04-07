import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import Badge from './Badge';
import './FluidEditor.css';

// Auto-resizing textarea for individual blocks
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

export default function FluidEditor({ blocks, onChange, placeholder = 'Start writing...' }) {
  const [activeToolbar, setActiveToolbar] = useState(null); // id of block showing toolbar
  const refs = useRef({});

  const generateId = () => `blk-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Initialize with empty block if empty
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

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Split logic
      const cursor = el.selectionStart;
      const textBefore = block.text.slice(0, cursor);
      const textAfter = block.text.slice(cursor);

      const newBlocks = [...blocks];
      newBlocks[index] = { ...block, text: textBefore };
      const newBlockId = generateId();
      newBlocks.splice(index + 1, 0, { id: newBlockId, text: textAfter, moveType: null });
      onChange(newBlocks);

      setTimeout(() => {
        if (refs.current[newBlockId]) refs.current[newBlockId].focus();
      }, 0);
    } 
    else if (e.key === 'Backspace' && block.text === '' && blocks.length > 1) {
      e.preventDefault();
      const newBlocks = [...blocks];
      newBlocks.splice(index, 1);
      onChange(newBlocks);
      const prevBlockId = blocks[index - 1]?.id;
      setTimeout(() => {
        if (refs.current[prevBlockId]) {
          const prevEl = refs.current[prevBlockId];
          prevEl.focus();
          prevEl.setSelectionRange(prevEl.value.length, prevEl.value.length);
        }
      }, 0);
    }
    else if (e.key === 'Backspace' && el.selectionStart === 0 && el.selectionEnd === 0 && index > 0) {
      e.preventDefault();
      const prevBlock = blocks[index - 1];
      const newCursorPos = prevBlock.text.length;
      
      const newBlocks = [...blocks];
      newBlocks[index - 1] = { ...prevBlock, text: prevBlock.text + block.text };
      newBlocks.splice(index, 1);
      onChange(newBlocks);

      setTimeout(() => {
        if (refs.current[prevBlock.id]) {
          const prevEl = refs.current[prevBlock.id];
          prevEl.focus();
          prevEl.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    }
    else if (e.key === 'ArrowUp' && el.selectionStart === 0 && index > 0) {
      e.preventDefault();
      const prevBlockId = blocks[index - 1].id;
      if (refs.current[prevBlockId]) {
        refs.current[prevBlockId].focus();
      }
    }
    else if (e.key === 'ArrowDown' && el.selectionStart === block.text.length && index < blocks.length - 1) {
      e.preventDefault();
      const nextBlockId = blocks[index + 1].id;
      if (refs.current[nextBlockId]) {
        refs.current[nextBlockId].focus();
      }
    }
  };

  const handleTagChange = (index, type) => {
    updateBlock(index, { moveType: type });
    setActiveToolbar(null);
  };

  // Click outside toolbar to close
  useEffect(() => {
    const clickHandler = () => setActiveToolbar(null);
    if (activeToolbar) {
      document.addEventListener('click', clickHandler);
    }
    return () => document.removeEventListener('click', clickHandler);
  }, [activeToolbar]);

  if (blocks.length === 0) return null;

  return (
    <div className="fluid-editor">
      {blocks.map((block, index) => (
        <div key={block.id} className="fluid-block">
          <div 
            className="fluid-block__gutter"
            onClick={(e) => {
              e.stopPropagation();
              setActiveToolbar(activeToolbar === block.id ? null : block.id);
            }}
          >
            <div className="fluid-block__gutter-icon" title="Tag paragraph">
              ⋮⋮
            </div>
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
                <div style={{ height: '1px', background: 'var(--paper-3)', margin: 'var(--space-2) 0' }}></div>
                <button className="fluid-toolbar__btn" onClick={() => handleTagChange(index, 'evidence')}>
                  <Badge type="move" variant="evidence" size="sm" /> Evidence
                </button>
                <button className="fluid-toolbar__btn" onClick={() => handleTagChange(index, 'naysayer')}>
                  <Badge type="move" variant="naysayer" size="sm" /> Naysayer
                </button>
                <button className="fluid-toolbar__btn" onClick={() => handleTagChange(index, 'context')}>
                  <Badge type="move" variant="context" size="sm" /> Context
                </button>
                <div style={{ height: '1px', background: 'var(--paper-3)', margin: 'var(--space-2) 0' }}></div>
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
              placeholder={index === 0 ? placeholder : 'Press shift+enter for line break...'}
              onChange={e => updateBlock(index, { text: e.target.value })}
              onKeyDown={e => handleKeyDown(e, index)}
              onFocus={() => { if (activeToolbar) setActiveToolbar(null); }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
