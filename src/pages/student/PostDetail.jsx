import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { api } from '../../lib/api';
import { AuthContext } from '../../context/AuthContext';
import { formatDate, formatTime, getTheySayLabel } from '../../lib/utils';
import './StudentPages.css';

const REACTION_TYPES = [
  { key: 'shifts', label: 'This shifts something for me' },
  { key: 'pushback', label: 'I want to push back' },
  { key: 'new', label: 'I hadn\'t thought of this' },
];

const COMMENT_TYPES = [
  { key: 'extending', label: 'Extending' },
  { key: 'complicating', label: 'Complicating' },
  { key: 'questioning', label: 'Questioning' },
  { key: 'affirming', label: 'Affirming' },
];

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [reflection, setReflection] = useState(null);
  const [refComments, setRefComments] = useState([]);
  const [refReactions, setRefReactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeReaction, setActiveReaction] = useState(null);
  const [commentType, setCommentType] = useState('extending');
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const r = await api.getReflectionById(id);
      if (r) {
        setReflection(r);
        const [c, rx] = await Promise.all([
          api.getComments(id),
          api.getReactions(id)
        ]);
        setRefComments(c);
        setRefReactions(rx);
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="post-detail">
        <Link to="/feed" className="post-detail__back">← Back to feed</Link>
        <p style={{ color: 'var(--ink-3)', margin: 'var(--space-8) 0', textAlign: 'center' }}>Loading post...</p>
      </div>
    );
  }

  if (!reflection) {
    return (
      <div className="post-detail">
        <Link to="/feed" className="post-detail__back">← Back to feed</Link>
        <p>Post not found.</p>
      </div>
    );
  }

  const ref = reflection;
  const authorName = ref.authorName || 'Student';
  const sourceLabel = getTheySayLabel(ref.theySaySource, { sessionTitle: ref.sessionTitle });

  // Group reactions by type with names
  const reactionGroups = {};
  refReactions.forEach(rx => {
    if (!reactionGroups[rx.type]) reactionGroups[rx.type] = [];
    reactionGroups[rx.type].push(rx.authorName || 'Student');
  });

  const toggleReaction = async (type) => {
    if (!user) return;
    
    // UI immediacy
    setActiveReaction(prev => prev === type ? null : type);
    
    try {
      await api.createReaction({
        reflectionId: id,
        userId: user.id,
        type
      });
      // Refresh reactions to see them counting
      const rx = await api.getReactions(id);
      setRefReactions(rx);
    } catch (err) {
      console.error('Reaction failed:', err);
    }
  };

  const handleSubmitComment = async () => {
    if (!user || !commentText.trim()) return;
    setIsSubmitting(true);

    try {
      const newCmt = await api.createComment({
        reflectionId: id,
        userId: user.id,
        type: commentType,
        content: commentText
      });
      // api calls might return author name if updated, or we provide it from user.name
      setRefComments(prev => [...prev, { ...newCmt, authorName: user.name }]);
      setCommentText('');
    } catch (err) {
      alert('Failed to post comment: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="post-detail">
      <Link to="/feed" className="post-detail__back">← Back to feed</Link>

      <div style={{ marginBottom: 'var(--space-6)' }}></div>

      {/* They Say source */}
      {sourceLabel && (
        <div className="post-detail__source">{sourceLabel}</div>
      )}

      {/* Author header */}
      <div className="post-detail__header">
        <Avatar name={authorName} size="lg" />
        <div className="post-detail__author-info">
          <span className="post-detail__author-name">{authorName}</span>
          <span className="post-detail__date">
            {formatDate(ref.createdAt)} · {formatTime(ref.createdAt)}
          </span>
        </div>
      </div>

      <h1 className="post-detail__title">{ref.title}</h1>
      <div className="post-detail__content">{ref.content}</div>

      {/* Reactions */}
      <div className="post-detail__reactions">
        <div className="post-detail__reactions-title">React</div>
        <div className="post-detail__reaction-btns">
          {REACTION_TYPES.map(rt => (
            <button
              key={rt.key}
              className={`post-detail__reaction-btn ${activeReaction === rt.key ? 'post-detail__reaction-btn--active' : ''}`}
              onClick={() => toggleReaction(rt.key)}
            >
              {rt.label}
            </button>
          ))}
        </div>
        {Object.keys(reactionGroups).length > 0 && (
          <div className="post-detail__reaction-people">
            {Object.entries(reactionGroups).map(([type, names]) => {
              const label = REACTION_TYPES.find(r => r.key === type)?.label;
              return (
                <span key={type} className="post-detail__reaction-line">
                  {names.join(' and ')} — "{label}"
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Comments */}
      <div className="post-detail__comments">
        <div className="post-detail__comments-title">
          {refComments.length} comment{refComments.length !== 1 ? 's' : ''}
        </div>

        {refComments.map(cmt => {
          const cmtAuthorName = cmt.authorName || 'Student';
          return (
            <div key={cmt.id} className="post-detail__comment">
              <div className="post-detail__comment-header">
                <Avatar name={cmtAuthorName} size="sm" />
                <span style={{ fontWeight: 500, fontSize: 'var(--text-sm)' }}>
                  {cmtAuthorName}
                </span>
                <Badge type="comment" variant={cmt.type} size="sm" />
                <span className="meta">{formatDate(cmt.createdAt)}</span>
              </div>
              <p className="post-detail__comment-content">{cmt.content}</p>
            </div>
          );
        })}

        {/* Comment form */}
        <div className="post-detail__comment-form">
          <div className="post-detail__comment-types">
            {COMMENT_TYPES.map(ct => (
              <button
                key={ct.key}
                className={`post-detail__comment-type-btn ${commentType === ct.key ? 'post-detail__comment-type-btn--active' : ''}`}
                onClick={() => setCommentType(ct.key)}
              >
                {ct.label}
              </button>
            ))}
          </div>
          <textarea
            className="post-detail__comment-input"
            placeholder="Write a comment…"
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
          />
          <div className="post-detail__comment-submit">
            <Button size="sm" disabled={!commentText.trim() || isSubmitting} onClick={handleSubmitComment}>
              {isSubmitting ? 'Posting...' : 'Post comment'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
