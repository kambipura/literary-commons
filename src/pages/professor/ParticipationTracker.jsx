import { useState, useEffect } from 'react';
import Avatar from '../../components/Avatar';
import { api } from '../../lib/api';
export default function ParticipationTracker() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    async function init() {
      try {
        const s = await api.getSessions('course-001');
        const st = await api.getEnrolledStudentsWithStats('course-001');
        setSessions(s);
        setStudents(st);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center', color: 'var(--ink-3)' }}>
        <p>Loading participation matrix...</p>
      </div>
    );
  }

  return (
    <div className="participation">
      <div className="participation__header">
        <h2>Participation</h2>
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          {sessions.map(v => (
            <div key={v.id} style={{ textAlign: 'center' }}>
              <div className="meta">S{v.number}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                -
              </div>
            </div>
          ))}
        </div>
      </div>

      <section>
        <div className="prof-section-title">
          <span>Activity Matrix</span>
          <span className="prof-section-line" />
        </div>
        <div className="participation__matrix-wrapper">
          <table className="participation__matrix">
            <thead>
              <tr>
                <th>Student</th>
                {sessions.map(s => (
                  <th key={s.id}>S{s.number}</th>
                ))}
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {students.map(row => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  {sessions.map((s, i) => (
                    <td key={i}>
                      <span className={`participation__cell participation__cell--empty`} title="Data sync pending..." />
                    </td>
                  ))}
                  <td>
                    <span style={{ color: 'var(--ink-3)', fontWeight: 600 }}>
                      →
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--ink-3)' }}>
          <p className="meta">Note: Real-time analytics engine is initializing. Historical tracking will appear soon.</p>
        </div>
      </section>
    </div>
  );
}
