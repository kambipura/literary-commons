import React from 'react';
import Badge from './Badge';
import './FluidEditor.css';

/**
 * ReadingView converts the modular Essay blocks into continuous prose.
 * It features interactive "Move Indicators" that reveal the paragraph's 
 * argumentative structure on hover.
 */
export default function ReadingView({ blocks = [] }) {
  if (!blocks || blocks.length === 0) {
    return (
      <div className="reading-view--empty">
        <p className="meta">No content to display in reading view.</p>
      </div>
    );
  }

  return (
    <div className="reading-view page-enter">
      {blocks.map((block) => (
        <div key={block.id} className="reading-paragraph">
          {/* Scientific/Argumentative Margin Indicator */}
          <div className="reading-paragraph__margin">
            {block.moveType && (
              <div className={`reading-paragraph__indicator reading-paragraph__indicator--${block.moveType}`}>
                <div className="reading-paragraph__label">
                  <Badge type="move" variant={block.moveType} size="sm" />
                </div>
              </div>
            )}
          </div>
          
          <div className="reading-paragraph__content">
            {block.text ? block.text : <span className="meta">[Empty paragraph]</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
