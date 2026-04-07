import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import './AdminPages.css';

export default function EnrollStudents() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [emailList, setEmailList] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetch() {
      const data = await api.getCourses();
      setCourses(data);
      setIsLoading(false);
    }
    fetch();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!courseId || !emailList.trim()) return;

    setIsSubmitting(true);
    const emails = emailList.split(/[\n,]+/).map(e => e.trim()).filter(Boolean);
    
    try {
      await api.enrollStudents(courseId, emails);
      navigate('/');
    } catch (err) {
      alert('Failed to enroll students: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center', color: 'var(--ink-3)' }}>
        <p>Loading course roster context...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div>
          <h1>Enroll Students</h1>
          <p className="meta">Batch import class rosters</p>
        </div>
      </header>

      <form className="admin-form page-enter" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="course">Target Course</label>
          <select 
            id="course" 
            className="form-control" 
            required 
            value={courseId}
            onChange={e => setCourseId(e.target.value)}
          >
            <option value="" disabled>Select a course...</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.code} - {course.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="emails">Student Email Addresses</label>
          <p className="meta" style={{ marginBottom: '8px' }}>Paste comma-separated or one per line</p>
          <textarea
            id="emails"
            className="form-control"
            placeholder="student1@sjcc.edu.in&#10;student2@sjcc.edu.in"
            required
            value={emailList}
            onChange={e => setEmailList(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/')} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Enrolling...' : 'Process Enrollment'}
          </button>
        </div>
      </form>
    </div>
  );
}
