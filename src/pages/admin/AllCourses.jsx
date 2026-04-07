import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import './AdminPages.css';

export default function AllCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const data = await api.getCourses();
      setCourses(data);
      setLoading(false);
    }
    fetch();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center', color: 'var(--ink-3)' }}>
        <p>Loading university instances...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div>
          <h1>All Courses</h1>
          <p className="meta">Manage platform instances and enrollments</p>
        </div>
        <div className="admin-header__actions">
          <Link to="/enroll" className="btn-secondary">Batch Enroll</Link>
          <Link to="/create" className="btn-primary">New Course</Link>
        </div>
      </header>

      <div className="courses-grid">
        {courses.map(course => (
          <div key={course.id} className="course-card">
            <div className="course-card__header">
              <div>
                <h3 className="course-card__title">{course.name}</h3>
                <p className="meta">{course.code} · {course.semester}</p>
              </div>
              <span className={`course-card__badge ${course.status === 'archived' ? 'course-card__badge--archived' : ''}`}>
                {course.status}
              </span>
            </div>
            
            <div className="course-card__meta">
              <div className="meta-item">
                <span className="label">Professor</span>
                <span className="value">Assigned Faculty</span>
              </div>
              <div className="meta-item">
                <span className="label">Students</span>
                <span className="value">
                  <Link to={`/roster/${course.id}`} className="link-gold">View Roster</Link>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
