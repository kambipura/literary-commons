import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import Button from '../../components/Button';
import './AdminPages.css';

export default function ManageStaff() {
  const [profiles, setProfiles] = useState([]);
  const [whitelist, setWhitelist] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('student');
  const [inviteName, setInviteName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [pData, wData] = await Promise.all([
      api.getProfiles(),
      api.getWhitelist()
    ]);
    setProfiles(pData);
    setWhitelist(wData);
    setIsLoading(false);
  }

  const handleInvite = async (e) => {
    e.preventDefault();
    const cleanEmail = inviteEmail.toLowerCase().trim();
    if (!cleanEmail) return;

    setIsSubmitting(true);
    try {
      await api.addToWhitelist([{
        email: cleanEmail,
        name: inviteName.trim(),
        role: inviteRole
      }]);
      setInviteEmail('');
      setInviteName('');
      await fetchData();
    } catch (err) {
      alert('Failed to add to whitelist: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.updateProfile(userId, { role: newRole });
      setProfiles(profiles.map(p => p.id === userId ? { ...p, role: newRole } : p));
    } catch (err) {
      alert('Failed to update role: ' + err.message);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This will remove all their data.')) return;
    try {
      await api.deleteProfile(userId);
      setProfiles(profiles.filter(p => p.id !== userId));
    } catch (err) {
      alert('Failed to delete user: ' + err.message);
    }
  };

  if (isLoading) return <div className="admin-dashboard">Loading users...</div>;

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div>
          <h1>Users & Staff</h1>
          <p className="meta">Manage permissions and authorized accounts</p>
        </div>
      </header>

      <section className="admin-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: 'var(--space-8)' }}>
        {/* Left: Invite Form */}
        <div className="admin-form page-enter" style={{ maxWidth: 'none' }}>
          <h2 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-lg)' }}>Invite / Pre-Authorize</h2>
          <form onSubmit={handleInvite}>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                className="form-control" 
                required 
                value={inviteEmail} 
                onChange={e => setInviteEmail(e.target.value)} 
                placeholder="colleague@sjcc.edu.in"
              />
            </div>
            <div className="form-group">
              <label>Name (Optional)</label>
              <input 
                type="text" 
                className="form-control" 
                value={inviteName} 
                onChange={e => setInviteName(e.target.value)} 
                placeholder="Full Name"
              />
            </div>
            <div className="form-group">
              <label>Assigned Role</label>
              <select 
                className="form-control" 
                value={inviteRole} 
                onChange={e => setInviteRole(e.target.value)}
              >
                <option value="student">Student</option>
                <option value="professor">Professor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <Button type="submit" disabled={isSubmitting} style={{ width: '100%', justifyContent: 'center' }}>
              {isSubmitting ? 'Adding...' : 'Add to Whitelist'}
            </Button>
          </form>

          <div style={{ marginTop: 'var(--space-8)' }}>
            <h3 className="meta" style={{ marginBottom: 'var(--space-3)' }}>Pending Whitelist ({whitelist.length})</h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {whitelist.map(w => (
                <div key={w.email} style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--paper-3)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{w.email} <span className="meta">({w.role})</span></span>
                  <button onClick={() => api.removeFromWhitelist(w.email).then(fetchData)} style={{ color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: User Table */}
        <div className="page-enter">
          <h2 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-lg)' }}>Registered Users ({profiles.length})</h2>
          <table className="enroll-preview" style={{ marginTop: 0 }}>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{p.name}</div>
                    <div className="meta" style={{ fontSize: '11px' }}>{p.email}</div>
                  </td>
                  <td>
                    <select 
                      className="form-control" 
                      style={{ padding: '2px 4px', fontSize: '12px', width: 'auto' }}
                      value={p.role}
                      onChange={e => handleRoleChange(p.id, e.target.value)}
                    >
                      <option value="student">Student</option>
                      <option value="professor">Professor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="meta" style={{ fontSize: '12px' }}>
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <button 
                      onClick={() => handleDelete(p.id)}
                      style={{ color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
