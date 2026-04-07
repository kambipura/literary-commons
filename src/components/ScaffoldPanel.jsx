import { useState } from 'react';
import './ScaffoldPanel.css';

const STARTERS = {
  'they-say': [
    'In [text], the argument is made that…',
    '[Author] complicates this by suggesting…',
    'A common assumption here is that…',
    'The conventional view holds that…',
    'According to [source]…',
  ],
  'i-say': [
    'I agree because…',
    'I disagree because…',
    'While this is true, it overlooks…',
    'What this fails to account for is…',
    'The implication I find most interesting is…',
    'My own view is that…',
    'I\'m of two minds about this. On the one hand… On the other…',
  ],
  'so-what': [
    'This matters because…',
    'At stake in this argument is…',
    'If we accept this, then we have to rethink…',
    'The larger point here is…',
    'Anyone who cares about… should be concerned because…',
  ],
};

export default function ScaffoldPanel({
  onInsert,
  isOpen = false,
  onToggle,
  className = '',
}) {
  const [activeTab, setActiveTab] = useState('they-say');

  const handleInsert = (starter) => {
    onInsert?.(starter);
  };

  return (
    <div className={`scaffold ${isOpen ? 'scaffold--open' : ''} ${className}`}>
      <button
        className="scaffold__toggle"
        onClick={onToggle}
        aria-label={isOpen ? 'Hide sentence starters' : 'Show sentence starters'}
        title="They Say / I Say sentence starters"
      >
        <span className="scaffold__toggle-icon">
          {isOpen ? '›' : '‹'}
        </span>
        {!isOpen && (
          <span className="scaffold__toggle-label">Starters</span>
        )}
      </button>

      {isOpen && (
        <div className="scaffold__panel">
          <div className="scaffold__tabs">
            {Object.keys(STARTERS).map(key => (
              <button
                key={key}
                className={`scaffold__tab ${activeTab === key ? 'scaffold__tab--active' : ''}`}
                onClick={() => setActiveTab(key)}
              >
                {key === 'they-say' && 'They Say'}
                {key === 'i-say' && 'I Say'}
                {key === 'so-what' && 'So What'}
              </button>
            ))}
          </div>

          <div className="scaffold__starters">
            {STARTERS[activeTab].map((starter, i) => (
              <button
                key={i}
                className="scaffold__starter"
                onClick={() => handleInsert(starter)}
                title="Click to insert"
              >
                <span className="scaffold__starter-text">{starter}</span>
                <span className="scaffold__starter-insert">+</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
