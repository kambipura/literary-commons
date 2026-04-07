import { useState, useRef, useEffect, useContext } from 'react';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import AutosaveIndicator from '../../components/AutosaveIndicator';
import FluidEditor from '../../components/FluidEditor';
import { api } from '../../lib/api';
import { AuthContext } from '../../context/AuthContext';
import './StudentPages.css';

export default function EssayBuilder() {
  const { user: currentUser } = useContext(AuthContext);
  const [essayId, setEssayId] = useState(null);
  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState([]);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [showPeerModal, setShowPeerModal] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Library state
  const [myReflections, setMyReflections] = useState([]);
  const [myNotes, setMyNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    async function fetchData() {
      const [refs, notesData, existingEssay] = await Promise.all([
        api.getReflections({ userId: currentUser.id }),
        api.getNotes(currentUser.id),
        api.getEssay(currentUser.id)
      ]);

      setMyReflections(refs);
      setMyNotes(notesData.filter(n => !n.isArchived));

      if (existingEssay) {
        setEssayId(existingEssay.id);
        setTitle(existingEssay.title || '');
        setBlocks(existingEssay.sections || []);
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
  }, [title, blocks, currentUser, loading]);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', color: 'var(--ink-3)' }}>
        <p>Loading your essay canvas...</p>
      </div>
    );
  }

  const theySayCount = blocks.filter(b => b.moveType === 'they-say').length;
  const iSayCount = blocks.filter(b => b.moveType === 'i-say').length;
  const soWhatCount = blocks.filter(b => b.moveType === 'so-what').length;
  const total = Math.max(theySayCount + iSayCount + soWhatCount, 1);

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
        <h2>Essay Canvas</h2>
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

      {/* Margins/Density Tracker */}
      <div className="essay-builder__density" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="essay-builder__density-bar">
          <span className="essay-builder__density-label">They Say</span>
          <div
            className="essay-builder__density-fill"
            style={{ width: `${(theySayCount / total) * 100}%`, backgroundColor: 'var(--move-they-say)', minWidth: '4px' }}
          />
          <span className="essay-builder__density-label">{theySayCount}</span>
        </div>
        <div className="essay-builder__density-bar">
          <span className="essay-builder__density-label">I Say</span>
          <div
            className="essay-builder__density-fill"
            style={{ width: `${(iSayCount / total) * 100}%`, backgroundColor: 'var(--move-i-say)', minWidth: '4px' }}
          />
          <span className="essay-builder__density-label">{iSayCount}</span>
        </div>
        <div className="essay-builder__density-bar">
          <span className="essay-builder__density-label">So What</span>
          <div
            className="essay-builder__density-fill"
            style={{ width: `${(soWhatCount / total) * 100}%`, backgroundColor: 'var(--move-so-what)', minWidth: '4px' }}
          />
          <span className="essay-builder__density-label">{soWhatCount}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'flex-start' }}>
        {/* Editor constraints */}
        <div style={{ flex: 1, minHeight: '60vh', borderLeft: 'var(--border-light)', paddingLeft: 'var(--space-4)' }}>
          <FluidEditor blocks={blocks} onChange={setBlocks} />
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
          <Button size="sm" variant="ghost" onClick={() => window.open(`/public/essay/${essay.id || 'essay-001'}`, '_blank')}>Publish to Web</Button>
          <Button size="sm" variant="primary">Submit Essay</Button>
        </div>
      </div>

      {showPeerModal && (
        <div className="modal-backdrop" onClick={() => setShowPeerModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: '400px', padding: 'var(--space-6)', background: 'var(--paper)', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ marginBottom: 'var(--space-2)' }}>Request Peer Review</h3>
            <p className="meta" style={{ marginBottom: 'var(--space-4)' }}>Send your draft to chosen classmates for unstructured feedback.</p>
            
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label className="meta" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Select Classmates:</label>
              <select multiple style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--paper-3)', minHeight: '80px', fontFamily: 'inherit' }}>
                <option value="stu-002">Priya Nair</option>
                <option value="stu-003">Samuel Thomas</option>
                <option value="stu-004">Aisha Fatima</option>
                <option value="stu-006">Kavya Menon</option>
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
