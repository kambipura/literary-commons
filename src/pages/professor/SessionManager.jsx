import { useState, useEffect, useContext } from 'react';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { api } from '../../lib/api';
import { AuthContext } from '../../context/AuthContext';
import {
  PROMPT_TYPES,
} from '../../data/mock';
import './ProfessorPages.css';

export default function SessionManager() {
  const { user } = useContext(AuthContext);
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [localSessions, setLocalSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // New session form state
  const [newTitle, setNewTitle] = useState('');
  const [newPromptType, setNewPromptType] = useState('they-say');
  const [newPromptText, setNewPromptText] = useState('');
  const [newIsActive, setNewIsActive] = useState(false);

  useEffect(() => {
    async function init() {
      if (!user) return;
      try {
        const courses = await api.getCourses();
        let courseId = null;
        const myCourses = courses.filter(c => c.professorId === user.id);
        
        if (myCourses.length > 0) {
          courseId = myCourses[0].id;
        } else if (courses.length > 0) {
          courseId = courses[0].id; 
        }

        if (courseId) {
          setActiveCourseId(courseId);
          const s = await api.getSessions(courseId);
          setLocalSessions(s);
        }
      } catch (err) {
        console.error('SessionManager init failed:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [user?.id]);

  const handleCreate = async () => {
    if (!newTitle.trim() || !newPromptText.trim() || !activeCourseId) return;
    setLoading(true);
    try {
      await api.createSession({
        courseId: activeCourseId,
        number: localSessions.length + 1,
        title: newTitle,
        promptType: newPromptType,
        theySayPrompt: newPromptText,
        isActive: newIsActive,
      });

      // Refresh list
      const s = await api.getSessions(activeCourseId);
      setLocalSessions(s);
      
      setNewTitle('');
      setNewPromptText('');
      setNewPromptType('they-say');
      setNewIsActive(false);
      setShowCreate(false);
    } catch (err) {
      alert('Failed to create session: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id) => {
    setLoading(true);
    try {
      const session = localSessions.find(s => s.id === id);
      await api.updateSession(id, {
        ...session,
        isActive: !session.isActive
      });

      // Refresh list
      const s = await api.getSessions(activeCourseId);
      setLocalSessions(s);
    } catch (err) {
      alert('Failed to update session: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center', color: 'var(--ink-3)' }}>
        <p>Managing course sessions...</p>
      </div>
    );
  }

  if (!activeCourseId) {
    return (
      <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
        <h3>No Course Context</h3>
        <p className="meta">Please identify a course to manage sessions.</p>
      </div>
    );
  }

  return (
    <div className="session-mgr page-enter">
      <div className="session-mgr__header">
        <h2>Sessions</h2>
        <Button size="sm" onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? 'Cancel' : '+ New Session'}
        </Button>
      </div>

      <div className="session-mgr__list">
        {localSessions.map(session => {
          const isEditing = editingId === session.id;
          return (
            <div
              key={session.id}
              className={`session-mgr__item ${session.isActive ? 'session-mgr__item--active' : ''} ${isEditing ? 'session-mgr__item--editing' : ''}`}
              onClick={() => !isEditing && setEditingId(session.id)}
            >
              <div className="session-mgr__item-header">
                <div>
                  <span className="session-mgr__item-num">Session {session.number}</span>
                  {session.promptType && (
                    <Badge
                      type="custom"
                      label={PROMPT_TYPES[session.promptType]?.label || session.promptType}
                      size="sm"
                    />
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  {session.isActive && (
                    <span className="session-mgr__active-badge">Active</span>
                  )}
                </div>
              </div>
              <div className="session-mgr__item-title">{session.title}</div>
              <div className={`session-mgr__item-prompt ${isEditing ? 'session-mgr__item-prompt--expanded' : ''}`}>
                {session.theySayPrompt}
              </div>

              {isEditing && (
                <div className="session-mgr__edit-form" onClick={e => e.stopPropagation()}>
                  <div className="session-mgr__item-actions">
                    <Button
                      size="sm"
                      variant={session.isActive ? 'secondary' : 'primary'}
                      onClick={() => toggleActive(session.id)}
                    >
                      {session.isActive ? 'Deactivate' : 'Set Active'}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      Close
                    </Button>
                  </div>
                  <div className="session-mgr__preview">
                    <div className="session-mgr__preview-label">Student view preview</div>
                    <div className="session-mgr__preview-title">{session.title}</div>
                    <div className="session-mgr__preview-prompt">{session.theySayPrompt}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {localSessions.length === 0 && !showCreate && (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)', opacity: 0.6 }}>
            <p>No sessions exist for this course.</p>
          </div>
        )}
      </div>

      {showCreate && (
        <div className="session-mgr__form">
          <h3 className="session-mgr__form-title">Create New Session</h3>
          <div className="session-mgr__form-group">
            <label className="session-mgr__form-label">Title</label>
            <input
              className="session-mgr__form-input"
              placeholder="e.g. The politics of translation"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
            />
          </div>
          <div className="session-mgr__form-group">
            <label className="session-mgr__form-label">Prompt type</label>
            <div className="session-mgr__prompt-types">
              {Object.entries(PROMPT_TYPES).map(([key, { label }]) => (
                <button
                  key={key}
                  className={`session-mgr__prompt-type-btn ${newPromptType === key ? 'session-mgr__prompt-type-btn--active' : ''}`}
                  onClick={() => setNewPromptType(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="session-mgr__form-group">
            <label className="session-mgr__form-label">Prompt</label>
            <textarea
              className="session-mgr__form-textarea"
              placeholder="Write the session prompt…"
              value={newPromptText}
              onChange={e => setNewPromptText(e.target.value)}
            />
          </div>
          <div className="session-mgr__form-group">
            <div
              className="session-mgr__form-toggle"
              onClick={() => setNewIsActive(!newIsActive)}
            >
              <div className={`session-mgr__toggle-track ${newIsActive ? 'session-mgr__toggle-track--active' : ''}`}>
                <div className="session-mgr__toggle-thumb" />
              </div>
              <span className="session-mgr__toggle-label">Set as active session</span>
            </div>
          </div>
          <div className="session-mgr__form-actions">
            <Button onClick={handleCreate} disabled={!newTitle.trim() || !newPromptText.trim()}>
              Create Session
            </Button>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
