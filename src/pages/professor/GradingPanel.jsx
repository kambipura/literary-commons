import { useState, useEffect, useContext } from 'react';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Toast from '../../components/Toast';
import { api } from '../../lib/api';
import { AuthContext } from '../../context/AuthContext';
import {
  formatDate,
} from '../../lib/utils';
import './ProfessorPages.css';

const GRADE_OPTIONS = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'];

export default function GradingPanel() {
  const { user: currentUser } = useContext(AuthContext);
  const [sessionFilter, setSessionFilter] = useState('all');
  const [studentFilter, setStudentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [showToast, setShowToast] = useState(null);
  const [loading, setLoading] = useState(true);

  // Live state
  const [allReflections, setAllReflections] = useState([]);
  const [allSessions, setAllSessions] = useState([]);
  const [localAnnotations, setLocalAnnotations] = useState([]);

  const [editGrade, setEditGrade] = useState('');
  const [editOverall, setEditOverall] = useState('');
  const [showStructured, setShowStructured] = useState(false);
  const [editTheySay, setEditTheySay] = useState('');
  const [editISay, setEditISay] = useState('');
  const [editSoWhat, setEditSoWhat] = useState('');

  useEffect(() => {
    async function fetchData() {
      const [refs, sess, anns] = await Promise.all([
        api.getReflections({ status: 'published' }),
        api.getSessions('course-001'),
        api.getAnnotations()
      ]);
      setAllReflections(refs);
      setAllSessions(sess);
      setLocalAnnotations(anns);
      setLoading(false);
    }
    fetchData();
  }, []);

  const published = allReflections;

  // Apply filters
  let filtered = published;
  if (sessionFilter !== 'all') filtered = filtered.filter(r => r.sessionId === sessionFilter);
  if (studentFilter !== 'all') filtered = filtered.filter(r => r.userId === studentFilter);
  if (statusFilter === 'graded') {
    filtered = filtered.filter(r => localAnnotations.some(a => a.reflection_id === r.id));
  } else if (statusFilter === 'ungraded') {
    filtered = filtered.filter(r => !localAnnotations.some(a => a.reflection_id === r.id));
  }

  // Sort newest first
  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const uniqueStudents = [...new Set(published.map(r => r.userId))];

  const expandItem = (ref) => {
    const existing = localAnnotations.find(a => a.reflection_id === ref.id);
    setExpandedId(ref.id);
    // Grade is currently implied in feedback text for this version
    setEditGrade(''); 
    setEditOverall(existing?.comment || '');
    setEditTheySay('');
    setEditISay('');
    setEditSoWhat('');
    setShowStructured(false);
  };

  const handleSave = async (refId) => {
    if (!editOverall && !editGrade) return;
    
    try {
      const newAnn = await api.createAnnotation({
        reflectionId: refId,
        professorId: currentUser?.id,
        comment: `Grade: ${editGrade}. ${editOverall}${editTheySay ? '\nThey Say: ' + editTheySay : ''}${editISay ? '\nI Say: ' + editISay : ''}`
      });
      
      setLocalAnnotations(prev => [...prev.filter(a => a.reflection_id !== refId), newAnn]);
      setShowToast('Grade saved');
      setExpandedId(null);
    } catch (err) {
      alert('Save failed: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center', color: 'var(--ink-3)' }}>
        <p>Loading grading submissions...</p>
      </div>
    );
  }

  const handleExport = () => {
    setShowToast('Export initiated — CSV will be ready shortly');
  };

  return (
    <div className="grading">
      {showToast && (
        <Toast message={showToast} type="success" onDismiss={() => setShowToast(null)} />
      )}

      <div className="grading__header">
        <h2>Grading</h2>
        <Button size="sm" variant="secondary" onClick={handleExport}>Export CSV</Button>
      </div>

      {/* Filters */}
      <div className="grading__filters">
        <select
          className="feed-prof__filter-select"
          value={sessionFilter}
          onChange={e => setSessionFilter(e.target.value)}
        >
          <option value="all">All Sessions</option>
        {allSessions.map(s => (
            <option key={s.id} value={s.id}>{s.number}. {s.title}</option>
          ))}
        </select>

        <select
          className="feed-prof__filter-select"
          value={studentFilter}
          onChange={e => setStudentFilter(e.target.value)}
        >
          <option value="all">All Students</option>
          {uniqueStudents.map(sid => (
            <option key={sid} value={sid}>Student ({sid.substring(0,6)})</option>
          ))}
        </select>

        <select
          className="feed-prof__filter-select"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="graded">Graded</option>
          <option value="ungraded">Ungraded</option>
        </select>
      </div>

      {/* Grading list */}
      <div className="grading__list">
        {filtered.map(ref => {
          const annotation = localAnnotations.find(a => a.reflection_id === ref.id);
          const isExpanded = expandedId === ref.id;

          return (
            <div key={ref.id} className={`grading__item ${isExpanded ? 'grading__item--expanded' : ''}`}>
              <div
                className="grading__item-summary"
                onClick={() => isExpanded ? setExpandedId(null) : expandItem(ref)}
              >
                <div className="grading__item-info">
                  <Avatar name={ref.authorName} size="sm" />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="grading__item-title">{ref.title}</div>
                    <div className="grading__item-author">{ref.authorName} · {formatDate(ref.createdAt)}</div>
                  </div>
                </div>
                {annotation ? (
                  <span className="grading__item-grade-badge">GRADED</span>
                ) : (
                  <span className="grading__item-ungraded">ungraded</span>
                )}
              </div>

              {isExpanded && (
                <div className="grading__detail">
                  {/* Left: student text */}
                  <div className="grading__detail-text">
                    <div className="prof-section-title" style={{ marginBottom: 'var(--space-2)' }}>
                      <span>Student's text</span>
                    </div>
                    <div className="grading__detail-text-content">{ref.content}</div>
                  </div>

                  {/* Right: grade form */}
                  <div className="grading__detail-form">
                    <div>
                      <label className="session-mgr__form-label">Grade</label>
                      <div className="grading__grade-selector">
                        {GRADE_OPTIONS.map(g => (
                          <button
                            key={g}
                            className={`grading__grade-btn ${editGrade === g ? 'grading__grade-btn--active' : ''}`}
                            onClick={() => setEditGrade(g)}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="session-mgr__form-label">Overall Feedback</label>
                      <textarea
                        className="grading__feedback-textarea"
                        placeholder="Write overall feedback…"
                        value={editOverall}
                        onChange={e => setEditOverall(e.target.value)}
                      />
                    </div>

                    <button
                      className="grading__structured-toggle"
                      onClick={() => setShowStructured(!showStructured)}
                    >
                      {showStructured ? '▾ Hide' : '▸ Show'} structured feedback (optional)
                    </button>

                    {showStructured && (
                      <div className="grading__structured-fields">
                        <div>
                          <div className="grading__structured-label">They Say</div>
                          <textarea
                            className="grading__feedback-textarea"
                            style={{ minHeight: '50px' }}
                            placeholder="How well they entered the conversation…"
                            value={editTheySay}
                            onChange={e => setEditTheySay(e.target.value)}
                          />
                        </div>
                        <div>
                          <div className="grading__structured-label">I Say</div>
                          <textarea
                            className="grading__feedback-textarea"
                            style={{ minHeight: '50px' }}
                            placeholder="Strength of their own position…"
                            value={editISay}
                            onChange={e => setEditISay(e.target.value)}
                          />
                        </div>
                        <div>
                          <div className="grading__structured-label">So What</div>
                          <textarea
                            className="grading__feedback-textarea"
                            style={{ minHeight: '50px' }}
                            placeholder="Did they extend the significance?…"
                            value={editSoWhat}
                            onChange={e => setEditSoWhat(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                      <Button size="sm" variant="ghost" onClick={() => setExpandedId(null)}>Cancel</Button>
                      <Button size="sm" onClick={() => handleSave(ref.id)} disabled={!editGrade}>
                        Save Grade
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p style={{ color: 'var(--ink-3)', fontStyle: 'italic', textAlign: 'center', padding: 'var(--space-8)' }}>
          No reflections match the current filter.
        </p>
      )}
    </div>
  );
}
