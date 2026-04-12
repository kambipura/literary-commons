import { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../../components/Button';
import AutosaveIndicator from '../../components/AutosaveIndicator';
import FluidEditor from '../../components/FluidEditor';
import { api } from '../../lib/api';
import { AuthContext } from '../../context/AuthContext';
import './StudentPages.css';

export default function WriteReflection() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);

  // Optional seed from Notebook "Promote" flow
  const seed = location.state?.seed || null;

  const [reflectionId, setReflectionId] = useState(null);
  const [session, setSession] = useState(null); // optional — never a blocker
  const [title, setTitle] = useState(seed?.title || '');
  const [blocks, setBlocks] = useState(
    seed?.content
      ? [{ id: `blk-${Date.now()}`, text: seed.content, moveType: null }]
      : []
  );
  const [privacy, setPrivacy] = useState('class');
  const [saveStatus, setSaveStatus] = useState('idle');
  const [isPublishing, setIsPublishing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        // Discover course (optional — used for session context only)
        let courseId = null;
        const enrollments = await api.getMyEnrollments(user.id);
        if (enrollments.length > 0) {
          courseId = enrollments[0].id;
        } else {
          const courses = await api.getCourses();
          if (courses.length > 0) {
            const activeCourse = courses.find(c => c.status === 'active');
            courseId = activeCourse ? activeCourse.id : courses[0].id;
          }
        }

        if (courseId) {
          // Load session as soft context — null is fine
          const curr = await api.getCurrentSession(courseId);
          setSession(curr);

          // If a session is active and no seed was passed in, try to resume a draft
          if (curr && !seed) {
            const myDrafts = await api.getReflections({
              userId: user.id,
              sessionId: curr.id,
              status: 'draft'
            });
            if (myDrafts && myDrafts.length > 0) {
              const draft = myDrafts[0];
              setReflectionId(draft.id);
              setTitle(draft.title || '');
              try {
                const parsed = JSON.parse(draft.content);
                setBlocks(Array.isArray(parsed) ? parsed : [{ id: `blk-${Date.now()}`, text: draft.content, moveType: null }]);
              } catch {
                setBlocks(
                  (draft.content || '').split('\n\n').map(t => ({
                    id: `blk-${Date.now()}-${Math.random()}`,
                    text: t,
                    moveType: null
                  }))
                );
              }
            }
          }
        }
      } catch (err) {
        console.error('WriteReflection fetch failed:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user?.id]);

  // LIVE AUTOSAVE — session is optional, writing is never blocked
  useEffect(() => {
    if (loading || !user) return;
    if (!title && blocks.length === 0) return;

    const timer = setTimeout(async () => {
      setSaveStatus('saving');
      const content = JSON.stringify(blocks);

      try {
        if (!reflectionId) {
          const created = await api.createReflection({
            userId: user.id,
            sessionId: session?.id || null,
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

  const handlePublish = async () => {
    if (!user) return;
    setIsPublishing(true);
    const content = JSON.stringify(blocks);

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
          sessionId: session?.id || null,
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
      <div className="write-zen write-zen--loading">
        <p>Opening canvas…</p>
      </div>
    );
  }

  const publishLabel = isPublishing
    ? 'Saving…'
    : privacy === 'draft' ? 'Save Draft'
    : privacy === 'public' ? 'Publish to Web'
    : 'Share with Class';

  return (
    <div className="write-zen">

      {/* Minimal floating header */}
      <header className="write-zen__header">
        <button className="write-zen__back" onClick={() => navigate('/feed')}>
          ← The Commons
        </button>
        <div className="write-zen__header-right">
          {session && (
            <span className="write-zen__session-nudge">
              ✦ {session.title}
            </span>
          )}
          <AutosaveIndicator status={saveStatus} />
        </div>
      </header>

      {/* Writing canvas */}
      <main className="write-zen__canvas">
        <input
          type="text"
          className="write-zen__title"
          placeholder="Give your reflection a title…"
          value={title}
          onChange={e => setTitle(e.target.value)}
          autoFocus={!seed}
        />
        <FluidEditor
          blocks={blocks}
          onChange={setBlocks}
          placeholder="What are you thinking after class today?…"
        />
      </main>

      {/* Floating action bar */}
      <div className="write-zen__fab">
        <div className="write-zen__fab-inner">
          <select
            className="write__privacy-select"
            value={privacy}
            onChange={e => setPrivacy(e.target.value)}
          >
            <option value="draft">Keep as draft</option>
            <option value="class">Share with class</option>
            <option value="public">Publish to web</option>
          </select>

          <Button
            size="sm"
            variant="accent"
            disabled={!title.trim() || blocks.length === 0 || isPublishing}
            onClick={handlePublish}
          >
            {publishLabel}
          </Button>

          {reflectionId && (
            <button
              className="meta-btn"
              style={{ color: 'var(--error)', marginLeft: 'var(--space-2)' }}
              onClick={async () => {
                if (confirm('Permanently delete this draft?')) {
                  await api.deleteReflection(reflectionId);
                  navigate('/');
                }
              }}
            >
              Discard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
