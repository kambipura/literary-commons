import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { api } from '../../lib/api';
import { AuthContext } from '../../context/AuthContext';
import { formatRelative } from '../../lib/utils';
import './ProfessorPages.css';

export default function CourseOverview() {
  const { user } = useContext(AuthContext);
  const [courseData, setCourseData] = useState(null);
  const [sessionList, setSessionList] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [allRecentReflections, setAllRecentReflections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      
      try {
        // 1. Get the first relevant course (professor might own multiple, but we show primary)
        let courseId = null;
        const courses = await api.getCourses();
        const myCourses = courses.filter(c => c.professorId === user.id);
        
        if (myCourses.length > 0) {
          courseId = myCourses[0].id;
        } else if (courses.length > 0) {
          courseId = courses[0].id; // Fallback for dev mode
        }

        if (!courseId) {
          setLoading(false);
          return;
        }

        const [c, s, curr, refs] = await Promise.all([
          api.getCourseById(courseId),
          api.getSessions(courseId),
          api.getCurrentSession(courseId),
          api.getReflections({ status: 'published' })
        ]);

        setCourseData(c);
        setSessionList(s);
        setActiveSession(curr);
        setAllRecentReflections(refs.slice(0, 10));
      } catch (err) {
        console.error('CourseOverview fetch failed:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user?.id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center', color: 'var(--ink-3)' }}>
        <p>Loading course dashboard...</p>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
        <h3>No Courses Found</h3>
        <p className="meta">Create a course as Admin to begin.</p>
      </div>
    );
  }

  const course = courseData;
  const sessions = sessionList;
  const currentSession = activeSession;

  const stats = { responseCount: 0, uniqueStudents: 0, avgWordCount: 0 };

  // Filter recent activity properly based on fetched state
  const recentRefs = allRecentReflections.slice(0, 4);

  return (
    <div className="prof-overview page-enter">
      <section>
        <div className="prof-overview__course-header">
          <h1>{course.name}</h1>
          <div className="prof-overview__course-meta">
            <span>{course.code}</span>
            <span>·</span>
            <span>{course.semester}</span>
            <span>·</span>
            <Badge type="custom" label={course.status.toUpperCase()} />
          </div>
        </div>
      </section>

      {/* Active session section */}
      {currentSession && currentSession.id && !currentSession.id.startsWith('sess-') ? (
        <section>
          <div className="prof-overview__session-card">
            <div className="prof-overview__session-top">
              <div>
                <span className="prof-overview__session-badge">Active · Session {currentSession.number}</span>
              </div>
              <div className="prof-overview__session-stats">
                <div className="prof-overview__stat">
                  <span className="prof-overview__stat-value">{stats.responseCount}</span>
                  <span className="prof-overview__stat-label">Responses</span>
                </div>
                <div className="prof-overview__stat">
                  <span className="prof-overview__stat-value">{stats.uniqueStudents}</span>
                  <span className="prof-overview__stat-label">Students</span>
                </div>
              </div>
            </div>
            <h3 style={{ marginBottom: 'var(--space-2)' }}>{currentSession.title}</h3>
            <p style={{ fontStyle: 'italic', color: 'var(--ink-2)', fontSize: 'var(--text-sm)' }}>
              {currentSession.theySayPrompt}
            </p>
          </div>
        </section>
      ) : (
        <section>
          <div className="prof-overview__session-card" style={{ borderStyle: 'dashed', opacity: 0.6 }}>
            <p className="meta">No active session for this course.</p>
            <Link to="/sessions"><Button variant="ghost" size="sm">Activate a session →</Button></Link>
          </div>
        </section>
      )}

      {/* Sessions list */}
      <section>
        <div className="prof-section-title">
          <span>Course Path</span>
          <span className="prof-section-line" />
        </div>
        <div className="prof-overview__timeline">
          {sessions.map(s => (
            <Link
              key={s.id}
              to="/sessions"
              className={`prof-overview__timeline-item ${s.isActive ? 'prof-overview__timeline-item--active' : ''}`}
            >
              <div className="prof-overview__timeline-num">Session {s.number}</div>
              <div className="prof-overview__timeline-title">{s.title}</div>
              {s.isActive && <div className="meta">Active Now</div>}
            </Link>
          ))}
          {sessions.length === 0 && <p className="meta">No sessions created yet.</p>}
        </div>
      </section>

      {/* Recent activity */}
      <section>
        <div className="prof-section-title">
          <span>Recent Activity</span>
          <span className="prof-section-line" />
        </div>
        <div className="prof-overview__activity-list">
          {recentRefs.map(ref => (
            <Link key={ref.id} to={`/post/${ref.id}`} className="prof-overview__activity-item">
              <Avatar name={ref.authorName || 'Student'} size="sm" />
              <span className="prof-overview__activity-text">
                <strong>{ref.authorName || 'Student'}</strong> published "{ref.title}"
              </span>
              <span className="meta">{formatRelative(ref.createdAt)}</span>
            </Link>
          ))}
          {recentRefs.length === 0 && <p className="meta">No recent student activity.</p>}
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <div className="prof-overview__actions" style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <Link to="/sessions"><Button size="sm">Manage Sessions</Button></Link>
          <Link to="/feed"><Button variant="secondary" size="sm">Class Feed</Button></Link>
          <Link to={`/roster/${course.id}`}><Button variant="secondary" size="sm">Student Roster</Button></Link>
        </div>
      </section>
    </div>
  );
}
