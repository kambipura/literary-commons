import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Button from '../../components/Button';
import TagInput from '../../components/TagInput';
import AutosaveIndicator from '../../components/AutosaveIndicator';
import FluidEditor from '../../components/FluidEditor';
import { api } from '../../lib/api';
import { AuthContext } from '../../context/AuthContext';
import './StudentPages.css';

export default function NoteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isNew = id === 'new';

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [saveStatus, setSaveStatus] = useState('idle');

  useEffect(() => {
    async function fetchNote() {
      if (!isNew) {
        const existingNote = await api.getNoteById(id);
        if (existingNote) {
          setTitle(existingNote.title || '');
          setUrl(existingNote.url || '');
          setTags(existingNote.tags || []);
          
          // Parse existing note into blocks
          let initialBlocks = [];
          if (existingNote.type === 'positioned') {
            initialBlocks = [
              { id: '1', text: existingNote.theySay || '', moveType: 'they-say' },
              { id: '2', text: existingNote.iSay || '', moveType: 'i-say' }
            ];
          } else if (existingNote.type === 'reading') {
            initialBlocks = [
              { id: '1', text: existingNote.passage || '', moveType: 'they-say' },
              { id: '2', text: existingNote.response || '', moveType: 'i-say' }
            ];
          } else {
            initialBlocks = [{ id: '1', text: existingNote.content || existingNote.whySaved || '', moveType: null }];
          }
          setBlocks(initialBlocks);
        }
        setLoading(false);
      }
    }
    fetchNote();
  }, [id, isNew]);

  useEffect(() => {
    if (loading || !user?.id) return;
    if (!title && blocks.length === 0) return;
    
    const timer = setTimeout(async () => {
      setSaveStatus('saving');
      
      const noteData = {
        title,
        content: blocks.map(b => b.text).join('\n\n'),
        type: 'free',
        metadata: { url, tags }
      };

      try {
        if (id === 'new') {
          const newNote = await api.createNote(user.id, noteData);
          setSaveStatus('saved');
          // Update URL to new note ID without triggering full reload/refetch
          navigate(`/notebook/${newNote.id}`, { replace: true });
        } else {
          await api.updateNote(id, noteData);
          setSaveStatus('saved');
        }
      } catch (err) {
        console.error('Autosave failed:', err);
        setSaveStatus('idle'); // or error
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [title, blocks, url, tags, loading, user?.id, id, navigate]);

  if (loading) {
    return (
      <div className="note-editor">
        <Link to="/notebook" className="note-editor__back">← Notebook</Link>
        <p style={{ textAlign: 'center', margin: 'var(--space-12) 0', color: 'var(--ink-3)' }}>Loading note...</p>
      </div>
    );
  }

  return (
    <div className="note-editor">
      <Link to="/notebook" className="note-editor__back">← Notebook</Link>

      <div className="note-editor__header">
        <h2 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>Private Note</h2>
        <AutosaveIndicator status={saveStatus} />
      </div>

      <input
        type="text"
        className="note-editor__title-input"
        placeholder="Untitled note…"
        value={title}
        onChange={e => setTitle(e.target.value)}
        style={{ marginBottom: 'var(--space-2)' }}
      />
      
      <input
        type="url"
        className="note-editor__url-input"
        placeholder="Paste a URL reference here (optional)…"
        value={url}
        onChange={e => setUrl(e.target.value)}
        style={{ width: '100%', border: 'none', borderBottom: '1px dashed var(--paper-3)', paddingBottom: 'var(--space-2)', marginBottom: 'var(--space-6)', backgroundColor: 'transparent' }}
      />

      <div className="note-editor__body" style={{ minHeight: '40vh', borderLeft: 'var(--border-light)', paddingLeft: 'var(--space-4)' }}>
        <p className="meta" style={{ marginBottom: 'var(--space-4)', opacity: 0.6 }}>Hover in the left margin to tag rhetorical moves.</p>
        <FluidEditor blocks={blocks} onChange={setBlocks} placeholder="Write freely…" />
      </div>

      <div style={{ marginTop: 'var(--space-6)', marginBottom: 'var(--space-4)' }}>
        <TagInput tags={tags} onChange={setTags} placeholder="Add tags…" />
      </div>

      <div className="note-editor__footer">
        <div className="note-editor__footer-left">
          <span className="meta">
            {blocks.reduce((acc, b) => acc + b.text.split(' ').filter(w => w).length, 0)} words
          </span>
        </div>
        <Button variant="secondary" size="sm">
          Promote to class draft →
        </Button>
      </div>
    </div>
  );
}
