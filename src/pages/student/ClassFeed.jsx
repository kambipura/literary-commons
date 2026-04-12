import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Card, { CardBody, CardFooter } from '../../components/Card';
import Badge from '../../components/Badge';
import Avatar from '../../components/Avatar';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import SessionSpotlight from '../../components/SessionSpotlight';
import ClassRoster from '../../components/ClassRoster';
import { api } from '../../lib/api';
import { AuthContext } from '../../context/AuthContext';
import { getTheySayLabel, formatRelative } from '../../lib/utils';
import './StudentPages.css';

const REACTION_LABELS = {
  shifts: 'This shifts something for me',
  pushback: 'I want to push back',
  new: 'I hadn\'t thought of this',
};

export default function ClassFeed() {
  const { user } = useContext(AuthContext);
  const [activeSession, setActiveSession] = useState(null);
  const [reflectionsData, setReflectionsData] = useState([]);
  const [myReflections, setMyReflections] = useState([]);
  const [roster, setRoster] = useState([]);
  const [chainsData, setChainsData] = useState([]);
  const [allComments, setAllComments] = useState([]);
  const [allReactions, setAllReactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentDraft, setRecentDraft] = useState(null);

  useEffect(() => {
    async function init() {
      if (!user?.id) return;
      setLoading(true);

      try {
        // 1. Get Course Context
        let courseId = null;
        const enrollments = await api.getMyEnrollments(user.id);
        
        if (enrollments.length > 0) {
          courseId = enrollments[0].id;
        } else {
          // Fallback discovery for Admins/Professors testing student view
          const courses = await api.getCourses();
          if (courses.length > 0) {
            // Priority: First active course
            const activeCourse = courses.find(c => c.status === 'active');
            courseId = activeCourse ? activeCourse.id : courses[0].id;
          }
        }

        if (!courseId) {
          setLoading(false);
          return;
        }

        // 2. Parallel Fetch Core Data
        const [sessions, c, myRefs, students] = await Promise.all([
          api.getSessions(courseId),
          api.getResponseChains(),
          api.getReflections({ userId: user.id }),
          api.getEnrolledStudentsWithStats(courseId)
        ]);

        setChainsData(c);
        setMyReflections(myRefs);
        setRoster(students);

        // Find active session — used only for the optional spotlight
        const current = sessions.find(sess => sess.isActive);
        setActiveSession(current);

        // Find most recent draft across all sessions for the nudge
        const drafts = myRefs.filter(r => r.status === 'draft')
          .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
        setRecentDraft(drafts[0]);

        await fetchFeed('all');
      } catch (err) {
        console.error('Hub initialization failed:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [user?.id]);

  const fetchFeed = async () => {
    // Fetch all published reflections — no session filter
    const refs = await api.getReflections({ status: 'published' });
    setReflectionsData(refs);

    const refIds = refs.map(r => r.id);
    if (refIds.length > 0) {
      const [cmts, rxs] = await Promise.all([
        Promise.all(refIds.map(id => api.getComments(id))),
        Promise.all(refIds.map(id => api.getReactions(id)))
      ]);
      setAllComments(cmts.flat());
      setAllReactions(rxs.flat());
    }
  };

  // Safe delete handler for the draft nudge
  const handleDeleteDraft = async (e, id) => {
    e.preventDefault();
    if (confirm('Delete this draft permanently?')) {
      await api.deleteReflection(id);
      setRecentDraft(null);
      setMyReflections(prev => prev.filter(r => r.id !== id));
    }
  };

  if (loading && reflectionsData.length === 0) {
    return (
      <div style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center', color: 'var(--ink-3)' }}>
        <p>Opening Class Hub...</p>
      </div>
    );
  }

  // Filter reflections by chained status
  const chainedIds = new Set(chainsData.flatMap(c => c.reflection_ids || c.reflectionIds));
  const chains = chainsData
    .map(chain => ({
      ...chain,
      posts: (chain.reflection_ids || chain.reflectionIds).map(id => reflectionsData.find(r => r.id === id)).filter(Boolean),
    }))
    .filter(chain => chain.posts.length > 0);

  const standalone = reflectionsData.filter(r => !chainedIds.has(r.id));

  const renderReactions = (refId) => {
    const refReactions = allReactions.filter(rx => rx.reflectionId === refId);
    if (refReactions.length === 0) return null;

    const grouped = {};
    refReactions.forEach(rx => {
      if (!grouped[rx.type]) grouped[rx.type] = [];
      const userName = rx.authorName || 'Student';
      grouped[rx.type].push(userName.split(' ')[0]);
    });

    return (
      <div className="feed__post-reactions">
        {Object.entries(grouped).map(([type, names]) => (
          <span key={type} className="feed__reaction-group">
            <Badge type="reaction" variant={type} size="sm" />
            <span className="feed__reaction-names">{names.join(' & ')}</span>
          </span>
        ))}
      </div>
    );
  };

  const renderPost = (ref) => {
    const authorName = ref.authorName || 'Student';
    const sourceLabel = getTheySayLabel(ref.theySaySource);
    const commentCount = allComments.filter(c => c.reflectionId === ref.id).length;

    return (
      <Link to={`/post/${ref.id}`} className="feed__post-card" key={ref.id}>
        <Card padding="md" hoverable>
          <CardBody>
            {sourceLabel && (
              <div className="feed__post-source">{sourceLabel}</div>
            )}
            <div className="feed__post-header">
              <Avatar name={authorName} size="sm" />
              <span className="feed__post-author">{authorName}</span>
              <span className="meta">{formatRelative(ref.createdAt)}</span>
            </div>
            <h4 className="feed__post-title">{ref.title}</h4>
            <p className="feed__post-preview">{ref.content}</p>
            {renderReactions(ref.id)}
            {commentCount > 0 && (
              <span className="feed__post-comments-count">
                {commentCount} comment{commentCount > 1 ? 's' : ''}
              </span>
            )}
          </CardBody>
        </Card>
      </Link>
    );
  };

  return (
    <div className="hub-layout">
      <div className="hub-main">
        {/* 1. Global Draft Nudge */}
        {recentDraft && (
          <div className="hub-draft-nudge page-enter">
            <div className="hub-draft-nudge__content">
              <Badge type="custom" label="Resume Draft" size="sm" />
              <span className="hub-draft-nudge__text">
                "<strong>{recentDraft.title || 'Untitled'}</strong>" — last edited {formatRelative(recentDraft.updatedAt)}
              </span>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--space-2)' }}>
                <button 
                  className="meta-btn" 
                  onClick={(e) => handleDeleteDraft(e, recentDraft.id)}
                >
                  Discard
                </button>
                <Link to="/write">
                  <Button size="xs" variant="accent">Continue</Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 2. Session Spotlight */}
        <SessionSpotlight 
          session={activeSession} 
          myReflections={myReflections.filter(r => r.sessionId === activeSession?.id)}
        />

        {/* 3. Conversations Feed */}
        <div className="feed">
          <div className="feed__header">
            <h3 className="section-title">The Conversation</h3>
          </div>

          {reflectionsData.length === 0 ? (
            <EmptyState type="feed" />
          ) : (
            <div className="feed__stream">
              {/* Chains first */}
              {chains.map(chain => (
                <div key={chain.id} className="feed__chain">
                  <div className="feed__chain-label">
                    <span>Response chain</span>
                    <span className="feed__chain-line" />
                    <span>{chain.title}</span>
                  </div>
                  <div className="feed__chain-posts">
                    {chain.posts.map((ref, i) => (
                      <div key={ref.id} className={`feed__post ${i === 0 ? 'feed__post--first' : ''}`}>
                        <div className="feed__post-dot" />
                        {renderPost(ref)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Standalone posts */}
              {standalone.map(ref => (
                <div key={ref.id} className="feed__standalone">
                  {renderPost(ref)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Roster Sidebar */}
      <aside className="hub-sidebar">
        <ClassRoster 
          students={roster} 
          currentUserId={user?.id}
          loading={loading}
        />
      </aside>
    </div>
  );
}
