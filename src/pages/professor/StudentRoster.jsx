import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import { api } from '../../lib/api';
import {
  formatDate,
} from '../../data/mock';
import './ProfessorPages.css';

export default function StudentRoster() {
  const { courseId } = useParams();
  const [students, setStudents] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const [studentData, courseData] = await Promise.all([
        api.getEnrolledStudentsWithStats(courseId),
        api.getCourseById(courseId)
      ]);
      setStudents(studentData);
      setCourse(courseData);
      setLoading(false);
    }
    fetchData();
  }, [courseId]);

  if (loading) {
    return (
      <div className="roster" style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12)' }}>
        <p>Loading course roster...</p>
      </div>
    );
  }

  if (!course) {
    return <div className="roster"><p>Course not found.</p></div>;
  }

  return (
    <div className="roster">
      <div className="roster__header">
        <h2>Student Roster</h2>
        <span className="meta">{course.name} · {students.length} enrolled</span>
      </div>

      <table className="roster__table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Reflections</th>
            <th>Avg Grade</th>
            <th>Last Active</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => {
            const isExpanded = expandedId === student.id;
            // For now, simplify participation metrics for the live view
            const hasActivity = !!student.enrolledAt;

            return (
              <>
                <tr
                  key={student.id}
                  onClick={() => setExpandedId(isExpanded ? null : student.id)}
                >
                  <td>
                    <div className="roster__name-cell">
                      <Avatar name={student.name} size="sm" />
                      <div>
                        <div style={{ fontWeight: 500 }}>{student.name}</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-3)' }}>{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="mono" style={{ fontSize: 'var(--text-sm)' }}>
                      {student.reflectionsCount}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: 'var(--ink-3)', fontSize: 'var(--text-xs)' }}>—</span>
                  </td>
                  <td>
                    <span className="meta">
                      {student.enrolledAt ? formatDate(student.enrolledAt) : 'No activity'}
                    </span>
                  </td>
                  <td>
                    {student.reflectionsCount === 0 && <span className="roster__flag" title="Needs attention">⚑</span>}
                  </td>
                </tr>

                {isExpanded && (
                  <tr key={`${p.studentId}-detail`} className="roster__detail">
                    <td colSpan={5}>
                      <div className="roster__detail-inner">
                        {/* Reflections */}
                        <div>
                          <div className="roster__detail-section-title">
                            Reflections ({studentRefs.length})
                          </div>
                          <div className="roster__detail-list">
                            {studentRefs.length === 0 && (
                              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-3)', fontStyle: 'italic' }}>
                                No published reflections
                              </span>
                            )}
                            {studentRefs.map(ref => {
                              const g = studentGrades.find(gr => gr.reflectionId === ref.id);
                              const session = sessions.find(s => s.id === ref.sessionId);
                              return (
                                <div key={ref.id} className="roster__detail-item">
                                  <div className="roster__detail-item-title">{ref.title}</div>
                                  <div className="roster__detail-item-meta">
                                    Session {session?.number || '?'}
                                    {g && ` · Grade: ${g.grade}`}
                                    {` · ${formatDate(ref.createdAt)}`}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Position evolution */}
                        <div>
                          <div className="roster__detail-section-title">Current Position</div>
                          {user?.rightNowIThink ? (
                            <div className="roster__position">
                              "{user.rightNowIThink}"
                            </div>
                          ) : (
                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-3)', fontStyle: 'italic' }}>
                              No position set
                            </span>
                          )}

                          <div className="roster__detail-section-title" style={{ marginTop: 'var(--space-4)' }}>
                            Annotations Received ({studentAnns.length})
                          </div>
                          <div className="roster__detail-list">
                            {studentAnns.slice(0, 3).map(ann => (
                              <div key={ann.id} className="roster__detail-item">
                                {ann.moveType && <Badge type="move" variant={ann.moveType} size="sm" />}
                                <div className="roster__detail-item-meta" style={{ marginTop: 'var(--space-1)' }}>
                                  {ann.comment?.slice(0, 80)}…
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Stats */}
                        <div>
                          <div className="roster__detail-section-title">Activity</div>
                          <div className="roster__detail-list">
                            <div className="roster__detail-item">
                              <div className="roster__detail-item-meta">
                                Comments: {student.commentsCount} · Reactions: {student.reactionsCount}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
