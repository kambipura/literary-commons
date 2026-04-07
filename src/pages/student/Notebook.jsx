import { useState, useMemo, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardBody } from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import { api } from '../../lib/api';
import { formatRelative } from '../../data/mock';
import { AuthContext } from '../../context/AuthContext';
import './StudentPages.css';

const NOTE_TYPES = [
  { key: 'all', label: 'All Notes' },
  { key: 'quote', label: 'Quote Vault' },
];

export default function Notebook() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [allNotes, setAllNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotes() {
      if (user?.id) {
        const data = await api.getNotes(user.id);
        setAllNotes(data);
        setLoading(false);
      }
    }
    fetchNotes();
  }, [user?.id]);

  const filtered = useMemo(() => {
    let result = allNotes;

    // Archive filter
    result = result.filter(n => showArchived ? n.isArchived : !n.isArchived);

    // Type filter
    if (typeFilter === 'quote') {
      result = result.filter(n => n.type === 'quote' || n.type === 'link' || n.type === 'reading');
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(n =>
        (n.title || '').toLowerCase().includes(q) ||
        (n.content || '').toLowerCase().includes(q) ||
        (n.theySay || '').toLowerCase().includes(q) ||
        (n.iSay || '').toLowerCase().includes(q) ||
        (n.passage || '').toLowerCase().includes(q) ||
        (n.response || '').toLowerCase().includes(q) ||
        (n.whySaved || '').toLowerCase().includes(q) ||
        (n.tags || []).some(t => t.includes(q))
      );
    }

    return result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [allNotes, typeFilter, search, showArchived]);

  const getPreview = (note) => {
    switch (note.type) {
      case 'fluid':
      case 'free': return note.content;
      case 'positioned': return note.iSay || note.theySay;
      case 'reading': return note.passage;
      case 'quote': return note.content; // from Chrome extension
      case 'link': return note.whySaved;
      default: return note.content || '';
    }
  };

  return (
    <div className="notebook">
      <div className="notebook__header">
        <h2>{user?.role === 'professor' ? 'Teaching Notebook' : 'Notebook'}</h2>
        <div className="notebook__controls">
          <div className="notebook__search">
            <span className="notebook__search-icon">⌕</span>
            <input
              type="text"
              className="notebook__search-input"
              placeholder="Search notes…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Button
            variant={showArchived ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setShowArchived(v => !v)}
          >
            {showArchived ? 'Archived' : 'Archive'}
          </Button>
          <Button size="sm" onClick={() => navigate('/notebook/new')}>
            + New note
          </Button>
        </div>
      </div>

      {/* Type filters */}
      <div className="notebook__filters">
        {NOTE_TYPES.map(t => (
          <button
            key={t.key}
            className={`notebook__filter-btn ${typeFilter === t.key ? 'notebook__filter-btn--active' : ''}`}
            onClick={() => setTypeFilter(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {typeFilter === 'quote' && (
        <div className="prototype-simulation-box" style={{ marginBottom: 'var(--space-6)' }}>
         <strong className="meta">Quote Vault</strong>
         <p className="meta" style={{ marginTop: 'var(--space-2)' }}>Highlights synced from the Chrome Extension will appear here.</p>
        </div>
      )}

      {/* Notes grid */}
      {loading ? (
        <div style={{ padding: 'var(--space-12) 0', textAlign: 'center', color: 'var(--ink-3)' }}>
          <p>Loading your notebook...</p>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          type={search ? 'search' : 'notebook'}
          action={
            !search && (
              <Button size="sm" onClick={() => navigate('/notebook/new')}>
                Begin a note
              </Button>
            )
          }
        />
      ) : (
        <div className="notebook__grid">
          {filtered.map(note => (
            <Card
              key={note.id}
              className="notebook__card"
              padding="md"
              onClick={() => navigate(`/notebook/${note.id}`)}
              hoverable
            >
              <CardBody>
                <div className="notebook__card-meta">
                  <Badge type="note" variant={note.type === 'quote' || note.type === 'link' || note.type === 'reading' ? 'reading' : 'free'} size="sm" />
                  <span className="meta">{formatRelative(note.updatedAt)}</span>
                </div>
                <h4 className="notebook__card-title">{note.title || 'Untitled'}</h4>
                <p className="notebook__card-preview">
                  {getPreview(note)?.slice(0, 120)}
                </p>
                {note.tags?.length > 0 && (
                  <div className="notebook__card-tags">
                    {note.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="notebook__card-tag">{tag}</span>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
