import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { api } from '../../lib/api';
import { AuthContext } from '../../context/AuthContext';
import {
  getUser,
  getTheySayLabel, formatDate, formatTime,
} from '../../data/mock';
import './ProfessorPages.css';

const MOVE_OPTIONS = [
  { key: 'they-say', label: 'They Say' },
  { key: 'i-say', label: 'I Say' },
  { key: 'so-what', label: 'So What' },
  { key: null, label: 'General' },
];

export default function PostDetailProf() {
  const { id } = useParams();
  const { user: professor } = useContext(AuthContext);
  const [reflection, setReflection] = useState(null);
  const [freeNote, setFreeNote] = useState(null);
  const [loading, setLoading] = useState(true);

  const [annotatingPara, setAnnotatingPara] = useState(null);
  const [annMoveType, setAnnMoveType] = useState(null);
  const [annComment, setAnnComment] = useState('');
  const [localAnnotations, setLocalAnnotations] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const r = await api.getReflectionById(id);
      if (r) {
        setReflection(r);
        const anns = await api.getAnnotations({ reflectionId: id });
        setLocalAnnotations(anns);
      } else {
        const n = await api.getNoteById(id);
        if (n) setFreeNote(n);
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="post-prof">
        <Link to="/feed" className="post-prof__back">← Back to feed</Link>
        <p style={{ textAlign: 'center', margin: 'var(--space-8) 0', color: 'var(--ink-3)' }}>Loading post...</p>
      </div>
    );
  }

  const post = reflection || freeNote;
  const isFreeNote = !!freeNote;

  if (!post) {
    return (
      <div className="post-prof">
        <Link to="/feed" className="post-prof__back">← Back to feed</Link>
        <p>Post not found.</p>
      </div>
    );
  }

  const authorName = post.authorName;
  const content = reflection ? reflection.content : (freeNote?.content || '');
  const title = reflection ? reflection.title : (freeNote?.title || 'Untitled');
  const createdAt = post.createdAt;
  const paragraphs = content.split('\n\n').filter(p => p.trim());
  const grade = null; // Grades logic can be refactored to annotations
  const sourceLabel = reflection ? getTheySayLabel(reflection.theySaySource) : null;

  const handleSaveAnnotation = async () => {
    if (!annComment.trim() || !professor) return;
    
    try {
      const newAnn = await api.createAnnotation({
        reflectionId: post.id,
        professorId: professor.id,
        paragraphIndex: annotatingPara,
        moveType: annMoveType,
        comment: annComment
      });
      setLocalAnnotations(prev => [...prev, newAnn]);
      setAnnotatingPara(null);
      setAnnComment('');
      setAnnMoveType(null);
    } catch (err) {
      alert('Failed to save annotation: ' + err.message);
    }
  };

  const cancelAnnotation = () => {
    setAnnotatingPara(null);
    setAnnComment('');
    setAnnMoveType(null);
  };

  return (
    <div className="post-prof">
      <Link to="/feed" className="post-prof__back">← Back to feed</Link>

      <div className="post-prof__main">
        {/* Content type */}
        <span className="post-prof__content-type">
          {isFreeNote ? 'Free Note' : 'Reflection'}
        </span>

        {/* Source label */}
        {sourceLabel && (
          <div style={{
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--ink-3)',
            fontStyle: 'italic', padding: 'var(--space-3) var(--space-4)',
            background: 'var(--paper-2)', borderLeft: '3px solid var(--move-they-say)',
            borderRadius: '0 var(--radius-md) var(--radius-md) 0', marginBottom: 'var(--space-4)',
          }}>
            {sourceLabel}
          </div>
        )}

        {/* Author */}
        <div className="post-prof__header">
          <Avatar name={authorName} size="lg" />
          <div>
            <div style={{ fontWeight: 500 }}>{authorName}</div>
            <div className="meta">{formatDate(createdAt)} · {formatTime(createdAt)}</div>
          </div>
          {grade && (
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 'var(--text-lg)', fontWeight: 600,
              color: 'var(--gold)', marginLeft: 'auto',
            }}>
              {grade.grade}
            </span>
          )}
        </div>

        <h1 className="post-prof__title">{title}</h1>

        {/* Paragraphs with gutter */}
        <div className="post-prof__paragraphs">
          {paragraphs.map((para, i) => {
            const paraAnns = localAnnotations.filter(a => a.paragraphIndex === i);
            const isAnnotated = paraAnns.length > 0;
            const isAnnotating = annotatingPara === i;

            return (
              <div key={i}>
                <div className={`post-prof__para-row ${isAnnotating ? 'post-prof__para-row--highlighted' : ''}`}>
                  <div className="post-prof__gutter">
                    <button
                      className={`post-prof__gutter-btn ${isAnnotated ? 'post-prof__gutter-btn--annotated' : ''}`}
                      onClick={() => {
                        if (isAnnotating) {
                          cancelAnnotation();
                        } else {
                          setAnnotatingPara(i);
                          setAnnMoveType(null);
                          setAnnComment('');
                        }
                      }}
                      title={isAnnotated ? `${paraAnns.length} annotation(s)` : 'Add annotation'}
                    >
                      {isAnnotated ? paraAnns.length : '+'}
                    </button>
                  </div>
                  <div className="post-prof__para-text">{para}</div>
                </div>

                {/* Annotation form */}
                {isAnnotating && (
                  <div className="post-prof__ann-form">
                    <div className="post-prof__ann-moves">
                      {MOVE_OPTIONS.map(opt => (
                        <button
                          key={opt.key || 'none'}
                          className={`post-prof__ann-move-btn post-prof__ann-move-btn--${opt.key || 'none'} ${annMoveType === opt.key ? 'post-prof__ann-move-btn--active' : ''}`}
                          onClick={() => setAnnMoveType(opt.key)}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    <textarea
                      className="post-prof__ann-input"
                      placeholder="Write feedback on this paragraph…"
                      value={annComment}
                      onChange={e => setAnnComment(e.target.value)}
                      autoFocus
                    />
                    <div className="post-prof__ann-actions">
                      <Button size="sm" variant="ghost" onClick={cancelAnnotation}>Cancel</Button>
                      <Button size="sm" onClick={handleSaveAnnotation} disabled={!annComment.trim()}>
                        Save
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick grade link */}
        {reflection && (
          <div style={{ paddingTop: 'var(--space-4)', borderTop: 'var(--border-light)' }}>
            <Link to="/grading">
              <Button variant="secondary" size="sm">
                {grade ? `Edit Grade (${grade.grade})` : 'Grade this reflection'}
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Sidebar: annotations */}
      <div className="post-prof__sidebar">
        <div className="prof-section-title">
          <span>Annotations</span>
          <span className="prof-section-line" />
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-3)' }}>
            {localAnnotations.length}
          </span>
        </div>
        <div className="post-prof__ann-list">
          {localAnnotations.length === 0 && (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-3)', fontStyle: 'italic' }}>
              Click the gutter next to a paragraph to annotate.
            </p>
          )}
          {localAnnotations.map(ann => (
            <div key={ann.id} className="post-prof__ann-item">
              <div className="post-prof__ann-item-header">
                {ann.moveType && (
                  <Badge type="move" variant={ann.moveType} size="sm" />
                )}
                {!ann.moveType && (
                  <Badge type="custom" label="General" size="sm" />
                )}
                <span className="meta">{formatDate(ann.createdAt)}</span>
              </div>
              <div className="post-prof__ann-item-comment">{ann.comment}</div>
              <div className="post-prof__ann-item-para">¶ {ann.paragraphIndex + 1}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
