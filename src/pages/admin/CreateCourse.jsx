import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { AuthContext } from '../../context/AuthContext';
import './AdminPages.css';

export default function CreateCourse() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [staffOptions, setStaffOptions] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    semester: '',
  });

  useEffect(() => {
    async function fetchStaff() {
      const data = await api.getStaffProfiles();
      setStaffOptions(data);
      // Auto-select current user
      if (user) setSelectedStaff([user.id]);
    }
    fetchStaff();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const newCourse = await api.createCourse({
        name: formData.name,
        code: formData.code,
        semester: formData.semester,
        professorId: selectedStaff[0] || user?.id // Primary for legacy field
      });

      // Assign all selected staff to the course
      if (selectedStaff.length > 1) {
        await api.updateCourseStaff(newCourse.id, selectedStaff);
      }

      navigate('/');
    } catch (err) {
      alert('Failed to provision course: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div>
          <h1>Create Course</h1>
          <p className="meta">Provision a new academic instance</p>
        </div>
      </header>

      <form className="admin-form page-enter" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Course Title</label>
          <input
            id="name"
            type="text"
            className="form-control"
            placeholder="e.g. Victorian Literature"
            required
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="code">Course Code</label>
          <input
            id="code"
            type="text"
            className="form-control"
            placeholder="e.g. 24B101"
            required
            value={formData.code}
            onChange={e => setFormData({ ...formData, code: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="semester">Semester / Term</label>
          <input
            id="semester"
            type="text"
            className="form-control"
            placeholder="e.g. Semester II 2026"
            required
            value={formData.semester}
            onChange={e => setFormData({ ...formData, semester: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="professor">Course Professors / Staff</label>
          <p className="meta" style={{ marginBottom: '8px' }}>Select one or more advisors for this course</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
            {staffOptions.map(staff => (
              <label key={staff.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={selectedStaff.includes(staff.id)}
                  onChange={e => {
                    if (e.target.checked) setSelectedStaff([...selectedStaff, staff.id]);
                    else setSelectedStaff(selectedStaff.filter(id => id !== staff.id));
                  }}
                />
                {staff.name} ({staff.role})
              </label>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/')}>
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Provision Course
          </button>
        </div>
      </form>
    </div>
  );
}
