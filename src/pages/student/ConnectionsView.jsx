import { useState, useMemo } from 'react';
import Card, { CardBody } from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import {
  notes, reflections, currentUserId, allTags, formatDate,
} from '../../data/mock';
import './StudentPages.css';

export default function ConnectionsView() {
  const [selectedTag, setSelectedTag] = useState(null);
  const [connectingNote, setConnectingNote] = useState('');

  // Get all items by current user that have tags
  const myItems = useMemo(() => {
    const myNotes = notes.filter(n => n.userId === currentUserId && !n.isArchived && n.tags?.length);
    const myRefs = reflections.filter(r => r.userId === currentUserId && r.tags?.length)
      .map(r => ({ ...r, entryType: 'reflection' }));
    return [
      ...myNotes.map(n => ({ ...n, entryType: 'note' })),
      ...myRefs,
    ];
  }, []);

  // Count tags
  const tagCounts = useMemo(() => {
    const counts = {};
    myItems.forEach(item => {
      (item.tags || []).forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1]);
  }, [myItems]);

  // Items matching selected tag
  const matchingItems = selectedTag
    ? myItems.filter(item => (item.tags || []).includes(selectedTag))
    : [];

  const getPreview = (item) => {
    if (item.content) return item.content.slice(0, 150);
    if (item.iSay) return item.iSay.slice(0, 150);
    if (item.response) return item.response.slice(0, 150);
    if (item.whySaved) return item.whySaved.slice(0, 150);
    return '';
  };

  return (
    <div className="connections">
      <div className="connections__header">
        <h2>Connections</h2>
        <p className="connections__subtitle">
          When two thoughts share a tag, they can meet here.
        </p>
      </div>

      {tagCounts.length === 0 ? (
        <EmptyState type="connections" />
      ) : (
        <>
          {/* Tag cloud */}
          <div className="connections__tag-cloud">
            {tagCounts.map(([tag, count]) => (
              <button
                key={tag}
                className={`connections__tag-btn ${selectedTag === tag ? 'connections__tag-btn--active' : ''}`}
                onClick={() => setSelectedTag(prev => prev === tag ? null : tag)}
              >
                #{tag} ({count})
              </button>
            ))}
          </div>

          {/* Split view */}
          {selectedTag && matchingItems.length >= 2 && (
            <>
              <div className="connections__split">
                {matchingItems.slice(0, 2).map(item => (
                  <div key={item.id} className="connections__split-pane">
                    <Card padding="md">
                      <CardBody>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                          {item.entryType === 'note' ? (
                            <Badge type="note" variant={item.type} size="sm" />
                          ) : (
                            <Badge type="custom" label="Reflection" size="sm" />
                          )}
                          <span className="meta">{formatDate(item.createdAt)}</span>
                        </div>
                        <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-base)', fontWeight: 500, marginBottom: 'var(--space-2)' }}>
                          {item.title}
                        </h4>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-2)', lineHeight: 'var(--leading-normal)' }}>
                          {getPreview(item)}…
                        </p>
                      </CardBody>
                    </Card>
                  </div>
                ))}
              </div>

              {/* Connecting note */}
              <div className="connections__connect-form">
                <div className="connections__connect-label">
                  How do these connect? What changed between then and now?
                </div>
                <textarea
                  className="connections__connect-textarea"
                  placeholder="I used to think… Now I think…"
                  value={connectingNote}
                  onChange={e => setConnectingNote(e.target.value)}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-3)' }}>
                  <Button size="sm" variant="secondary" disabled={!connectingNote.trim()}>
                    Save connection → Essay Builder
                  </Button>
                </div>
              </div>
            </>
          )}

          {selectedTag && matchingItems.length < 2 && (
            <p style={{ color: 'var(--ink-3)', fontStyle: 'italic', textAlign: 'center', padding: 'var(--space-6)' }}>
              Only one item with this tag. A connection needs at least two.
            </p>
          )}
        </>
      )}
    </div>
  );
}
