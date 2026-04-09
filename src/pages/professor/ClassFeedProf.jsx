import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import { api } from '../../lib/api';
import {
  getTheySayLabel, formatRelative,
} from '../../lib/utils';
import './ProfessorPages.css';

export default function ClassFeedProf() {
  const [sessionFilter, setSessionFilter] = useState('all');
  const [studentFilter, setStudentFilter] = useState('all');
  const [courseData, setCourseData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [reflectionsData, setReflectionsData] = useState([]);
  const [chainsData, setChainsData] = useState([]);
  const [allComments, setAllComments] = useState([]);
  const [allReactions, setAllReactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredId, setFeaturedId] = useState(null);

  useEffect(() => {
    async function init() {
      const [c, s, ch] = await Promise.all([
        api.getCourseById('course-001'),
        api.getSessions('course-001'),
        api.getResponseChains()
      ]);
      setCourseData(c);
      setSessions(s);
      setChainsData(ch);
      setFeaturedId(c.featuredChainId);
      await fetchFeed('all', 'all');
    }
    init();
  }, []);

  const fetchFeed = async (sid, uid) => {
    setLoading(true);
    const refs = await api.getReflections({ 
      sessionId: sid === 'all' ? null : sid,
      userId: uid === 'all' ? null : uid,
      status: 'published' 
    });
    setReflectionsData(refs);
    
    const refIds = refs.map(r => r.id);
    const [cmts, rxs] = await Promise.all([
      Promise.all(refIds.map(id => api.getComments(id))),
      Promise.all(refIds.map(id => api.getReactions(id)))
    ]);
    
    setAllComments(cmts.flat());
    setAllReactions(rxs.flat());
    setLoading(false);
  };

  const handleSessionChange = (sid) => {
    setSessionFilter(sid);
    fetchFeed(sid, studentFilter);
  };

  const handleStudentChange = (uid) => {
    setStudentFilter(uid);
    fetchFeed(sessionFilter, uid);
  };

  if (loading && reflectionsData.length === 0) {
    return (
      <div style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center', color: 'var(--ink-3)' }}>
        <p>Loading class feed...</p>
      </div>
    );
  }

  // Published reflections match the current fetch
  const filtered = reflectionsData;

  // Group into chains and standalone
  const chains = chainsData
    .filter(chain => {
      const chainRefs = chain.reflectionIds.map(id => filtered.find(r => r.id === id)).filter(Boolean);
      return chainRefs.length > 0;
    })
    .map(chain => ({
      ...chain,
      posts: chain.reflectionIds.map(id => filtered.find(r => r.id === id)).filter(Boolean),
    }));

  const chainedIds = new Set(chainsData.flatMap(c => c.reflectionIds));
  const standalone = filtered.filter(r => !chainedIds.has(r.id));

  // Get unique students from ALL published reflections for the filter (mock/fallback works here)
  const uniqueStudents = [...new Set(reflectionsData.map(r => r.userId))];

  const renderPost = (ref) => {
    const authorName = ref.authorName || 'Student';
    const sourceLabel = getTheySayLabel(ref.theySaySource);
    const commentCount = allComments.filter(c => c.reflectionId === ref.id).length;
    const reactionCount = allReactions.filter(r => r.reflectionId === ref.id).length;
    const grade = null; // No grades fetched yet

    return (
      <Link to={`/post/${ref.id}`} key={ref.id} className="feed-prof__post-card">
        <div className="feed-prof__post-header">
          <Avatar name={authorName} size="sm" />
          <span className="feed-prof__post-author">{authorName}</span>
          <span className="meta">{formatRelative(ref.createdAt)}</span>
          {!grade && <span className="feed-prof__ungraded-dot" title="Ungraded" />}
        </div>
        {sourceLabel && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--ink-3)', marginBottom: 'var(--space-1)' }}>
            {sourceLabel}
          </div>
        )}
        <div className="feed-prof__post-title">{ref.title}</div>
        <div className="feed-prof__post-preview">{ref.content}</div>
        <div className="feed-prof__post-footer">
          <span>{reactionCount} reactions</span>
          <span>{commentCount} comments</span>
          {grade && <span style={{ color: 'var(--gold)' }}>{grade.grade}</span>}
        </div>
      </Link>
    );
  };

  return (
    <div className="feed-prof">
      <div className="feed-prof__header">
        <h2>Class Feed</h2>
      </div>

      {/* Filters */}
      <div className="feed-prof__filters">
        <select
          className="feed-prof__filter-select"
          value={sessionFilter}
          onChange={e => handleSessionChange(e.target.value)}
        >
          <option value="all">All Sessions</option>
          {sessions.map(s => (
            <option key={s.id} value={s.id}>{s.number}. {s.title}</option>
          ))}
        </select>

        <select
          className="feed-prof__filter-select"
          value={studentFilter}
          onChange={e => handleStudentChange(e.target.value)}
        >
          <option value="all">All Students</option>
          {uniqueStudents.map(sid => (
            <option key={sid} value={sid}>Student ({sid.substring(0,6)})</option>
          ))}
        </select>
      </div>

      {/* Response chains */}
      {chains.map(chain => {
        const participants = new Set(chain.posts.map(p => p.userId)).size;
        const totalComments = chain.posts.reduce((acc, p) => acc + allComments.filter(c => c.reflectionId === p.id).length, 0);

        return (
          <div key={chain.id} className="feed-prof__chain">
            <div className="feed-prof__chain-header">
              <div className="feed-prof__chain-label">
                <span>Response chain</span>
                <span className="prof-section-line" />
                <span>{chain.title}</span>
              </div>
              <div className="feed-prof__chain-stats">
                <span>{participants} voices</span>
                <span>{totalComments} comments</span>
              </div>
              <button
                className={`feed-prof__star-btn ${featuredId === chain.id ? 'feed-prof__star-btn--active' : ''}`}
                onClick={() => setFeaturedId(featuredId === chain.id ? null : chain.id)}
                title={featuredId === chain.id ? 'Remove from featured' : 'Feature for class discussion'}
              >
                ★
              </button>
            </div>
            {chain.posts.map(ref => renderPost(ref))}
          </div>
        );
      })}

      {/* Standalone posts */}
      {standalone.map(ref => renderPost(ref))}

      {filtered.length === 0 && (
        <p style={{ color: 'var(--ink-3)', fontStyle: 'italic', textAlign: 'center', padding: 'var(--space-8)' }}>
          No reflections match the current filter.
        </p>
      )}
    </div>
  );
}
