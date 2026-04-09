import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card, { CardBody, CardFooter } from '../../components/Card';
import Badge from '../../components/Badge';
import Avatar from '../../components/Avatar';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import { api } from '../../lib/api';
import {
  getUser, getTheySayLabel,
  formatRelative,
} from '../../data/mock';
import './StudentPages.css';

const REACTION_LABELS = {
  shifts: 'This shifts something for me',
  pushback: 'I want to push back',
  new: 'I hadn\'t thought of this',
};

export default function ClassFeed() {
  const [sessionFilter, setSessionFilter] = useState('all');
  const [sessions, setSessions] = useState([]);
  const [reflectionsData, setReflectionsData] = useState([]);
  const [chainsData, setChainsData] = useState([]);
  const [allComments, setAllComments] = useState([]);
  const [allReactions, setAllReactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const [s, c] = await Promise.all([
        api.getSessions('course-001'),
        api.getResponseChains()
      ]);
      setSessions(s);
      setChainsData(c);
      await fetchFeed('all');
    }
    init();
  }, []);

  const fetchFeed = async (sessionId) => {
    setLoading(true);
    const refs = await api.getReflections({ sessionId, status: 'published' });
    setReflectionsData(refs);
    
    // Bulk fetch comments and reactions for these reflections to avoid N+1 UI sluggishness
    // In Phase 8.2 fallback, this still works correctly.
    const refIds = refs.map(r => r.id);
    const [cmts, rxs] = await Promise.all([
      Promise.all(refIds.map(id => api.getComments(id))),
      Promise.all(refIds.map(id => api.getReactions(id)))
    ]);
    
    setAllComments(cmts.flat());
    setAllReactions(rxs.flat());
    setLoading(false);
  };

  const handleFilterChange = (sid) => {
    setSessionFilter(sid);
    fetchFeed(sid);
  };

  if (loading && reflectionsData.length === 0) {
    return (
      <div style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center', color: 'var(--ink-3)' }}>
        <p>Loading class feed...</p>
      </div>
    );
  }

  // Published reflections are already filtered and fetched
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

  const renderReactions = (refId) => {
    const refReactions = allReactions.filter(rx => rx.reflectionId === refId);
    if (refReactions.length === 0) return null;

    const grouped = {};
    refReactions.forEach(rx => {
      if (!grouped[rx.type]) grouped[rx.type] = [];
      // If we don't have user name in reaction, we try fallback to mock/api lookup
      // For now we assume if live data fails, we look in mock.
      const userName = rx.authorName || getUser(rx.userId)?.name;
      grouped[rx.type].push(userName?.split(' ')[0] || 'Student');
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

  const renderPost = (ref, isFirst = false) => {
    const authorName = ref.authorName || getUser(ref.userId)?.name;
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
    <div className="feed">
      <div className="feed__header">
        <h2>Class Feed</h2>
        <Link to="/write">
          <Button size="sm">Write a reflection</Button>
        </Link>
      </div>

      {/* Session filter */}
      <div className="feed__session-filter">
        <button
          className={`notebook__filter-btn ${sessionFilter === 'all' ? 'notebook__filter-btn--active' : ''}`}
          onClick={() => setSessionFilter('all')}
        >
          All sessions
        </button>
        {sessions.map(s => (
          <button
            key={s.id}
            className={`notebook__filter-btn ${sessionFilter === s.id ? 'notebook__filter-btn--active' : ''}`}
            onClick={() => handleFilterChange(s.id)}
          >
            {s.number}. {s.title}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState type="feed" />
      ) : (
        <>
          {/* Response chains */}
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
                    {renderPost(ref, i === 0)}
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
        </>
      )}
    </div>
  );
}
