import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import Avatar from './Avatar';
import './Header.css';

export default function UserDropdown({ user, logout }) {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState({ courses: 0, submissions: 0, engagements: 0, publicPostings: 0 });
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      api.getUserStats(user.id).then(setStats);
    }
  }, [user?.id]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleLabel = user?.role === 'professor' ? 'Professor' 
    : user?.role === 'admin' ? 'Administrator' 
    : 'Student';

  return (
    <div className="user-dropdown" ref={dropdownRef}>
      <button 
        className="user-dropdown__toggle" 
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Avatar name={user?.name} size="sm" />
      </button>

      {isOpen && (
        <div className="user-dropdown__menu page-enter">
          <div className="user-dropdown__header">
            <div className="user-dropdown__identity">
              <Avatar name={user?.name} size="md" />
              <div className="user-dropdown__info">
                <div className="user-dropdown__name">{user?.name}</div>
                <div className="user-dropdown__email">{user?.email}</div>
                <div className={`user-dropdown__role-badge ${user?.role}`}>
                  {roleLabel}
                </div>
              </div>
            </div>
          </div>

          <div className="user-dropdown__stats">
            <div className="user-dropdown__stat-item">
              <span className="user-dropdown__stat-value">{stats.courses}</span>
              <span className="user-dropdown__stat-label">Courses</span>
            </div>
            <div className="user-dropdown__stat-item">
              <span className="user-dropdown__stat-value">{stats.submissions}</span>
              <span className="user-dropdown__stat-label">Submissions</span>
            </div>
            <div className="user-dropdown__stat-item">
              <span className="user-dropdown__stat-value">{stats.engagements}</span>
              <span className="user-dropdown__stat-label">Engagements</span>
            </div>
            <div className="user-dropdown__stat-item">
              <span className="user-dropdown__stat-value">{stats.publicPostings}</span>
              <span className="user-dropdown__stat-label">Public Posts</span>
            </div>
          </div>

          <div className="user-dropdown__actions">
            <button className="user-dropdown__action-btn" onClick={() => navigate('/notebook')}>
              My Notebook
            </button>
            <button className="user-dropdown__action-btn logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
