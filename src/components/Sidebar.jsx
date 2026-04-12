import { useState, useEffect, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { api } from '../lib/api';
import './Sidebar.css';

const STUDENT_NAV = [
  { to: '/',         label: 'The Commons', icon: '◉' },
  { to: '/write',    label: 'Write',       icon: '✎' },
  { to: '/notebook', label: 'Notebook',    icon: '▤' },
  { to: '/thread',   label: 'My Thread',   icon: '⟿' },
  { to: '/essay',    label: 'Essay',       icon: '▬' },
];

const PROFESSOR_NAV = [
  { to: '/',           label: 'Overview',     icon: '◉' },
  { to: '/notebook',   label: 'Notebook',     icon: '▤' },
  { to: '/feed',       label: 'Conversations', icon: '◫' },
  { to: '/enroll',     label: 'Enroll Students', icon: '⊞' },
  { to: '/roster',     label: 'Class Roster',   icon: '⊞' },
  { to: '/grading',    label: 'Feedback & Grading', icon: '✎' },
  { to: '/participation', label: 'Participation', icon: '⟿' },
];

const ADMIN_NAV = [
  { to: '/',           label: 'All Courses',  icon: '◉' },
  { to: '/create',     label: 'Create Course',icon: '✎' },
  { to: '/enroll',     label: 'Enroll',       icon: '⊞' },
  { to: '/staff',      label: 'Users & Staff',icon: '⌘' },
  { to: '/notebook',   label: 'Notebook',     icon: '▤' },
];

export default function Sidebar({ isOpen, onClose, className = '' }) {
  const { user, role: currentRole, setRole } = useContext(AuthContext);
  const [courseContext, setCourseContext] = useState({ name: 'Literary Commons', code: '' });

  useEffect(() => {
    async function fetchCourseContext() {
      if (!user) return;
      try {
        let course = null;
        if (currentRole === 'student') {
          const enrollments = await api.getMyEnrollments(user.id);
          if (enrollments && enrollments.length > 0) course = enrollments[0];
        } else {
          const courses = await api.getCourses();
          const myCourses = courses.filter(c => c.professorId === user.id);
          course = myCourses[0] || courses[0];
        }

        if (course) {
          setCourseContext({ name: course.name, code: course.code });
        }
      } catch (err) {
        console.error('Sidebar context fetch failed:', err);
      }
    }
    fetchCourseContext();
  }, [user?.id, currentRole]);

  const nav = currentRole === 'professor' ? PROFESSOR_NAV
    : currentRole === 'admin' ? ADMIN_NAV
    : STUDENT_NAV;

  const displayTitle = currentRole === 'admin' ? 'Administration' : courseContext.name;

  return (
    <>
      {isOpen && (
        <div className="sidebar__backdrop" onClick={onClose} />
      )}
      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''} ${className}`}>
        <div className="sidebar__course">
          <span className="sidebar__course-label">{displayTitle}</span>
          {courseContext.code && currentRole !== 'admin' && (
            <span className="sidebar__course-code">{courseContext.code}</span>
          )}
        </div>

        <nav className="sidebar__nav" aria-label="Main navigation">
          {nav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
              }
              onClick={onClose}
            >
              <span className="sidebar__link-icon">{item.icon}</span>
              <span className="sidebar__link-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Developer / Testing Role Switcher - only visible in dev mode or with specific flag */}
        {import.meta.env.VITE_DEV_MODE === 'true' && (
          <div className="sidebar__dev-tools">
            <span className="meta" style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '10px' }}>
              VIEW AS (DEV)
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['student', 'professor', 'admin'].map(r => (
                <button
                  key={r}
                  onClick={() => { setRole(r); onClose(); }}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '9px',
                    textTransform: 'uppercase',
                    border: '1px solid var(--paper-3)',
                    background: currentRole === r ? 'var(--gold)' : 'var(--paper)',
                    color: currentRole === r ? 'white' : 'var(--ink-2)',
                    cursor: 'pointer'
                  }}
                >
                  {r[0]}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="sidebar__footer">
          <span className="sidebar__semester">Semester I · 2026</span>
        </div>
      </aside>
    </>
  );
}
