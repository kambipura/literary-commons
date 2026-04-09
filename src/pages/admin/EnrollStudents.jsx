import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import Button from '../../components/Button';
import './AdminPages.css';

export default function EnrollStudents() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [inputText, setInputText] = useState('');
  const [parsedStudents, setParsedStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetch() {
      const data = await api.getCourses();
      setCourses(data);
      setIsLoading(false);
    }
    fetch();
  }, []);

  // Live CSV Parsing logic
  useEffect(() => {
    if (!inputText.trim()) {
      setParsedStudents([]);
      return;
    }

    const lines = inputText.split('\n').filter(line => line.trim());
    const students = lines.map(line => {
      // Split by comma or tab
      const parts = line.split(/[,\t]+/).map(p => p.trim());
      
      // Expected format: email, name, reg_no
      return {
        email: parts[0] || '',
        name: parts[1] || '',
        registerNumber: parts[2] || ''
      };
    }).filter(s => s.email);

    setParsedStudents(students);
  }, [inputText]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!courseId || parsedStudents.length === 0) return;

    setIsSubmitting(true);
    
    try {
      await api.enrollStudents(courseId, parsedStudents);
      setSuccess(true);
    } catch (err) {
      alert('Failed to enroll students: ' + err.message);
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

  if (success) {
    const enrolledCount = parsedStudents.length;
    const courseName = courses.find(c => c.id === courseId)?.name || 'the course';

    return (
      <div className="admin-dashboard page-enter" style={{ textAlign: 'center', paddingTop: 'var(--space-12)' }}>
        <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>✅</div>
        <h1 style={{ marginBottom: 'var(--space-2)' }}>Import Successful</h1>
        <p className="meta" style={{ marginBottom: 'var(--space-8)', fontSize: '1.1rem' }}>
          {courseId ? (
            <>{enrolledCount} student{enrolledCount !== 1 ? 's have' : ' has'} been added to <strong style={{ color: 'var(--ink)' }}>{courseName}</strong>.</>
          ) : (
            <>{enrolledCount} student{enrolledCount !== 1 ? 's have' : ' has'} been whitelisted to access the platform.</>
          )}
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center' }}>
          {courseId && (
            <Link to={`/roster/${courseId}`}>
              <Button>View Student Roster</Button>
            </Link>
          )}
          <Button variant="ghost" onClick={() => {
            setSuccess(false);
            setInputText('');
            setParsedStudents([]);
          }}>
            Import More Students
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div>
          <h1>Enroll Students</h1>
          <p className="meta">Batch import class rosters via CSV</p>
        </div>
      </header>

      <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: parsedStudents.length > 0 ? '1fr 1fr' : '1fr', gap: 'var(--space-8)' }}>
        <form className="admin-form page-enter" onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 'none' }}>
          <div className="form-group">
            <label htmlFor="course">Target Course</label>
            <select 
              id="course" 
              className="form-control" 
              value={courseId}
              onChange={e => setCourseId(e.target.value)}
            >
              <option value="">No Course (Whitelist Only)</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="emails">Student Roster (CSV / Tabular)</label>
            <p className="meta" style={{ marginBottom: 'var(--space-2)' }}>Format: <code>email, name, register_no</code></p>
            <textarea
              id="emails"
              className="form-control"
              placeholder="student@univ.edu, John Doe, REG123&#10;student2@univ.edu, Jane Smith, REG456"
              required
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              disabled={isSubmitting}
              style={{ minHeight: '300px', fontFamily: 'monospace', fontSize: '13px' }}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate('/')} disabled={isSubmitting}>
              Cancel
            </button>
            <Button type="submit" disabled={isSubmitting || parsedStudents.length === 0}>
              {isSubmitting ? 'Processing...' : `Import ${parsedStudents.length} Student${parsedStudents.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </form>

        {parsedStudents.length > 0 && (
          <div className="page-enter">
            <h3 className="dashboard__section-title" style={{ marginTop: 0 }}>Import Preview</h3>
            <table className="enroll-preview">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Reg. No</th>
                </tr>
              </thead>
              <tbody>
                {parsedStudents.map((s, i) => (
                  <tr key={i}>
                    <td>{s.email}</td>
                    <td>{s.name || <em style={{ opacity: 0.5 }}>-</em>}</td>
                    <td>{s.registerNumber || <em style={{ opacity: 0.5 }}>-</em>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="meta" style={{ marginTop: 'var(--space-4)' }}>
              Check the data above. Names and Register Numbers will be used to automatically set up student profiles.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
