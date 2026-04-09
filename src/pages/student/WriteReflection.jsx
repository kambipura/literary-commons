import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import AutosaveIndicator from '../../components/AutosaveIndicator';
import FluidEditor from '../../components/FluidEditor';
import { api } from '../../lib/api';
import { AuthContext } from '../../context/AuthContext';
import {
  formatRelative,
  getUser,
} from '../../data/mock';
import './StudentPages.css';

export default function WriteReflection() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [reflectionId, setReflectionId] = useState(null);
  const [session, setSession] = useState(null);
  const [classmateRefs, setClassmateRefs] = useState([]);
  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState([]);
  const [privacy, setPrivacy] = useState('class');
  const [saveStatus, setSaveStatus] = useState('idle');
  const [isPublishing, setIsPublishing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      
      try {
        // Get the first relevant course (enrolled or created)
        let courseId = null;
        const enrollments = await api.getMyEnrollments(user.id);
        if (enrollments.length > 0) {
          courseId = enrollments[0].id;
        } else {
          const allCourses = await api.getCourses();
          if (allCourses.length > 0) courseId = allCourses[0].id;
        }

        if (!courseId) {
          setLoading(false);
          return;
        }

        const curr = await api.getCurrentSession(courseId);
        setSession(curr);

        if (curr) {
          // Look for existing draft
          const myDrafts = await api.getReflections({ 
            userId: user.id, 
            sessionId: curr.id,
            status: 'draft' 
          });
          
          if (myDrafts && myDrafts.length > 0) {
            const draft = myDrafts[0];
            setReflectionId(draft.id);
            setTitle(draft.title || '');
            // Parse content back into blocks
            setBlocks(draft.content.split('\n\n').map(t => ({ 
              id: `blk-${Date.now()}-${Math.random()}`, 
              text: t, 
              moveType: null 
            })));
          }
        }

        const allPublished = await api.getReflections({ status: 'published' });
        setClassmateRefs(allPublished.filter(r => r.userId !== user?.id));
      } catch (err) {
        console.error('WriteReflection fetch failed:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user?.id]);

  // LIVE AUTOSAVE
  useEffect(() => {
    if (loading || !user || !session || !session.id) return;
    if (!title && blocks.length === 0) return;

    const timer = setTimeout(async () => {
      setSaveStatus('saving');
      const content = blocks.map(b => b.text).join('\n\n');
      
      try {
        // Ensure we are not sending mock IDs to Supabase
        if (session.id.startsWith('sess-')) {
          console.warn('Cannot autosave to mock session ID');
          setSaveStatus('idle');
          return;
        }

        if (!reflectionId) {
          const created = await api.createReflection({
            userId: user.id,
            sessionId: session.id,
            title,
            content,
            privacy: 'draft',
            status: 'draft'
          });
          setReflectionId(created.id);
        } else {
          await api.updateReflection(reflectionId, {
            title,
            content,
            privacy,
            status: 'draft'
          });
        }
        setSaveStatus('saved');
      } catch (err) {
        console.error('Autosave failed:', err.message);
        setSaveStatus('idle');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [title, blocks, user, session, loading, reflectionId, privacy]);

  const insertSource = (content) => {
    const newBlock = {
      id: `blk-${Date.now()}-${Math.random()}`,
      text: content,
      moveType: null
    };
    setBlocks(prev => [...prev, newBlock]);
  };

  const handlePublish = async () => {
    if (!user || !session || !session.id) return;
    
    if (session.id.startsWith('sess-')) {
      alert('Cannot publish to a mock session. Please create a real course and session as Admin first.');
      return;
    }

    setIsPublishing(true);
    const content = blocks.map(b => b.text).join('\n\n'); 
    
    try {
      if (reflectionId) {
        await api.updateReflection(reflectionId, {
          title,
          content,
          privacy,
          status: privacy === 'draft' ? 'draft' : 'published'
        });
      } else {
        await api.createReflection({
          userId: user.id,
          sessionId: session.id,
          title,
          content,
          privacy,
          status: privacy === 'draft' ? 'draft' : 'published'
        });
      }
      navigate('/feed');
    } catch (err) {
      alert('Failed to publish: ' + err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', color: 'var(--ink-3)' }}>
        <p>Loading your reflection canvas...</p>
      </div>
    );
  }

  return (
    <div className="write">
      <div className="write__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <h2 style={{ margin: 0 }}>Class Reflection</h2>
          <p className="meta" style={{ margin: 0, marginTop: 'var(--space-1)' }}>Respond freely. Use the margin gutters to tag core moves.</p>
        </div>
        <AutosaveIndicator status={saveStatus} />
      </div>

      {!session || !session.id || session.id.startsWith('sess-') ? (
        <div style={{ padding: 'var(--space-12)', textAlign: 'center', background: 'var(--paper-2)', borderRadius: 'var(--radius-lg)' }}>
          <h3>No Active Session Found</h3>
          <p className="meta" style={{ marginBottom: 'var(--space-6)' }}>You need an active session in a real course to write a reflection.</p>
          <Button onClick={() => navigate('/')}>Return to Dashboard</Button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minHeight: '60vh', borderLeft: 'var(--border-light)', paddingLeft: 'var(--space-4)' }}>
            <input
              type="text"
              className="write__title-input"
              placeholder="Title your reflection…"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ marginBottom: 'var(--space-6)', width: '100%', fontSize: 'var(--text-xl)' }}
            />
            <FluidEditor blocks={blocks} onChange={setBlocks} />
          </div>

          <div style={{ width: '280px', flexShrink: 0, paddingLeft: 'var(--space-4)', borderLeft: 'var(--border)', maxHeight: '70vh', overflowY: 'auto' }}>
            <h4 style={{ marginBottom: 'var(--space-4)', color: 'var(--ink-2)' }}>Discussion Context</h4>
            {session && (
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <span className="meta" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Session Prompt</span>
                <div className="course-card" style={{ padding: 'var(--space-3)', cursor: 'pointer' }} onClick={() => insertSource(session.theySayPrompt)}>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-2)', margin: 0 }}>{session.theySayPrompt}</p>
                </div>
              </div>
            )}
            {classmateRefs.length > 0 && (
              <div>
                <span className="meta" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Classmate Arguments</span>
                {classmateRefs.map(r => {
                  const authorName = getUser(r.userId)?.name;
                  const snippet = `As ${authorName} argued: "${r.content.substring(0, 100)}..."`;
                  return (
                    <div key={r.id} className="course-card" style={{ padding: 'var(--space-3)', marginBottom: 'var(--space-2)', cursor: 'pointer' }} onClick={() => insertSource(snippet)}>
                      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, margin: 0, marginBottom: '2px', lineHeight: 1.2 }}>{r.title}</p>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-3)', margin: 0 }}>by {authorName}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {session && session.id && !session.id.startsWith('sess-') && (
        <div className="write__footer" style={{ marginTop: 'var(--space-8)' }}>
          <div className="write__footer-left">
            <select
              className="write__privacy-select"
              value={privacy}
              onChange={e => setPrivacy(e.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="class">Class only</option>
              <option value="public">Public</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {reflectionId && (
              <Button 
                variant="ghost" 
                size="sm" 
                style={{ color: 'var(--error)' }}
                onClick={async () => {
                  if (confirm('Permanently delete this draft?')) {
                    await api.deleteReflection(reflectionId);
                    navigate('/');
                  }
                }}
              >
                Discard Draft
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => navigate('/feed')}>
              Cancel
            </Button>
            <Button 
              size="sm" 
              disabled={!title.trim() || blocks.length === 0 || isPublishing}
              onClick={handlePublish}
            >
              {isPublishing ? 'Saving...' : (privacy === 'draft' ? 'Save draft' : 'Publish')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
