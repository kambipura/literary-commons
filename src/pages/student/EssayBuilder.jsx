import { useState, useRef, useEffect, useContext } from 'react';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import AutosaveIndicator from '../../components/AutosaveIndicator';
import FluidEditor from '../../components/FluidEditor';
import ReadingView from '../../components/ReadingView';
import { api } from '../../lib/api';
import { AuthContext } from '../../context/AuthContext';
import './StudentPages.css';

export default function EssayBuilder() {
  const { user: currentUser } = useContext(AuthContext);
  const [essayId, setEssayId] = useState(null);
  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState([]);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [viewMode, setViewMode] = useState('blocks'); // 'blocks' | 'reading'
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showPeerModal, setShowPeerModal] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [classmates, setClassmates] = useState([]);

  // Library state
  const [myReflections, setMyReflections] = useState([]);
  const [myNotes, setMyNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    async function fetchData() {
      const [refs, notesData, existingEssay, enrollments] = await Promise.all([
        api.getReflections({ userId: currentUser.id }),
        api.getNotes(currentUser.id),
        api.getEssay(currentUser.id),
        api.getMyEnrollments(currentUser.id)
      ]);

      setMyReflections(refs);
      setMyNotes(notesData.filter(n => !n.isArchived));

      if (existingEssay) {
        setEssayId(existingEssay.id);
        setTitle(existingEssay.title || '');
        setBlocks(existingEssay.sections || []);
      }

      // Fetch classmates from all enrolled courses
      if (enrollments && enrollments.length > 0) {
        const studentLists = await Promise.all(
          enrollments.map(e => api.getEnrolledStudents(e.id))
        );
        // Flatten and filter out self
        const allClassmates = studentLists
          .flat()
          .filter(s => s && s.id !== currentUser.id);
        
        // De-duplicate by ID
        const uniqueClassmates = Array.from(new Map(allClassmates.map(s => [s.id, s])).values());
        setClassmates(uniqueClassmates);
      }

      setLoading(false);
    }
    fetchData();
  }, [currentUser]);

  // LIVE AUTOSAVE
  useEffect(() => {
    if (loading || !currentUser) return;

    const timer = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        const saved = await api.saveEssay({
          id: essayId,
          userId: currentUser.id,
          title,
          sections: blocks,
          status: 'draft'
        });
        if (saved && !essayId) setEssayId(saved.id);
        setSaveStatus('saved');
      } catch (err) {
        setSaveStatus('idle');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [title, blocks, currentUser, loading, essayId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', color: 'var(--ink-3)' }}>
        <p>Loading your essay canvas...</p>
      </div>
    );
  }

  const handleSubmitEssay = async () => {
    if (!currentUser) return;
    setIsSubmitting(true);
    setSaveStatus('saving');
    try {
      const saved = await api.saveEssay({
        id: essayId,
        userId: currentUser.id,
        title,
        sections: blocks,
        status: 'published'
      });
      if (saved && !essayId) setEssayId(saved.id);
      setSaveStatus('saved');
      alert('Essay published successfully!');
    } catch (err) {
      alert('Failed to submit: ' + err.message);
      setSaveStatus('idle');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishToWeb = async () => {
    if (!currentUser) return;
    setIsSubmitting(true);
    setSaveStatus('saving');
    try {
      const saved = await api.saveEssay({
        id: essayId,
        userId: currentUser.id,
        title,
        sections: blocks,
        status: 'published'
      });
      if (saved && !essayId) setEssayId(saved.id);
      setSaveStatus('saved');
      window.open(`/public/essay/${saved.id}`, '_blank');
    } catch (err) {
      alert('Failed to publish: ' + err.message);
      setSaveStatus('idle');
    } finally {
      setIsSubmitting(false);
    }
  };

  const insertSource = (content) => {
    const newBlock = {
      id: `blk-${Date.now()}-${Math.random()}`,
      text: content,
      moveType: null
    };
    setBlocks(prev => [...prev, newBlock]);
  };

  const insertWorksCitedSkeleton = () => {
    const skeleton = "Works Cited\n\nLast Name, First Name. Title of Book. Publisher, Publication Date.\n\nAuthor. \"Title of Article.\" Title of Journal, Volume, Issue, Year, pages.";
    setBlocks(prev => [...prev, { id: `blk-${Date.now()}-wc`, text: skeleton, moveType: null }]);
  };

  return (
    <div className="essay-builder">
      <div className="essay-builder__header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <h2>Essay Canvas</h2>
          <div className="view-toggle">
            <button 
              className={`view-toggle__btn ${viewMode === 'blocks' ? 'active' : ''}`}
              onClick={() => setViewMode('blocks')}
            >
              Blocks
            </button>
            <button 
              className={`view-toggle__btn ${viewMode === 'reading' ? 'active' : ''}`}
              onClick={() => setViewMode('reading')}
            >
              Reading
            </button>
          </div>
        </div>
        <AutosaveIndicator status={saveStatus} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
        <input
          type="text"
          className="essay-builder__title-input"
          placeholder="Title your essay…"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{ flex: 1 }}
        />
        <Button size="sm" variant="ghost" onClick={insertWorksCitedSkeleton}>+ Works Cited Format</Button>
      </div>


      <div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'flex-start' }}>
        {/* Editor constraints */}
        <div style={{ flex: 1, minHeight: '60vh', borderLeft: 'var(--border-light)', paddingLeft: 'var(--space-4)' }}>
          {viewMode === 'blocks' ? (
            <FluidEditor blocks={blocks} onChange={setBlocks} />
          ) : (
            <ReadingView blocks={blocks} />
          )}
        </div>

        {/* Sources side-panel */}
        <div style={{ width: '280px', flexShrink: 0, paddingLeft: 'var(--space-4)', borderLeft: 'var(--border)', maxHeight: '70vh', overflowY: 'auto' }}>
          <h4 style={{ marginBottom: 'var(--space-4)', color: 'var(--ink-2)' }}>Your Library</h4>
          
          {myReflections.length > 0 && (
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <span className="meta" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Reflections</span>
              {myReflections.map(r => (
                <div key={r.id} className="course-card" style={{ padding: 'var(--space-3)', marginBottom: 'var(--space-2)', cursor: 'pointer' }} onClick={() => insertSource(r.content)}>
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, margin: 0, marginBottom: '4px', lineHeight: 1.2 }}>{r.title}</p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-3)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.content}</p>
                </div>
              ))}
            </div>
          )}

          {myNotes.length > 0 && (
            <div>
              <span className="meta" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Notes</span>
              {myNotes.map(n => {
                const preview = n.content || n.iSay || n.response || n.whySaved;
                return (
                  <div key={n.id} className="course-card" style={{ padding: 'var(--space-3)', marginBottom: 'var(--space-2)', cursor: 'pointer' }} onClick={() => insertSource(preview)}>
                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, margin: 0, marginBottom: '4px', lineHeight: 1.2 }}>{n.title}</p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-3)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{preview}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="essay-builder__footer" style={{ marginTop: 'var(--space-8)' }}>
        <span className="meta">{blocks.length} paragraphs · Word count: {blocks.reduce((acc, b) => acc + b.text.split(' ').filter(w => w).length, 0)}</span>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Button size="sm" variant="ghost" onClick={() => setShowPeerModal(true)}>Request Peer Review</Button>
          <Button size="sm" variant="ghost" onClick={handlePublishToWeb} disabled={isSubmitting}>Publish to Web</Button>
          <Button size="sm" variant="primary" onClick={handleSubmitEssay} disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit Essay'}</Button>
        </div>
      </div>

      {showPeerModal && (
        <div className="modal-backdrop" onClick={() => setShowPeerModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: '400px', padding: 'var(--space-6)', background: 'var(--paper)', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ marginBottom: 'var(--space-2)' }}>Request Peer Review</h3>
            <p className="meta" style={{ marginBottom: 'var(--space-4)' }}>Send your draft to chosen classmates for unstructured feedback.</p>
            
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label className="meta" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Select Classmates:</label>
              <select multiple style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--paper-3)', minHeight: '120px', fontFamily: 'inherit' }}>
                {classmates.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
                {classmates.length === 0 && (
                  <option disabled>No classmates found</option>
                )}
              </select>
              <span className="meta" style={{ fontSize: '10px', marginTop: '4px', display: 'block' }}>Hold Ctrl/Cmd to select multiple</span>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', fontSize: 'var(--text-sm)', cursor: 'pointer' }}>
              <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} />
              Keep my identity anonymous during review
            </label>

            <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
              <Button size="sm" variant="ghost" onClick={() => setShowPeerModal(false)}>Cancel</Button>
              <Button size="sm" onClick={() => { alert('Requests sent!'); setShowPeerModal(false); }}>Send Requests</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
