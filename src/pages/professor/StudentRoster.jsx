import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import { api } from '../../lib/api';
import {
  formatDate,
} from '../../lib/utils';
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
            <th>Reg. No</th>
            <th>Reflections</th>
            <th>Avg Grade</th>
            <th>Last Active</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => {
            const isExpanded = expandedId === student.id;
            const isPending = student.isPending;
            
            return (
              <React.Fragment key={student.id}>
                <tr
                  onClick={() => setExpandedId(isExpanded ? null : student.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <div className="roster__name-cell">
                      {isPending ? (
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--paper-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                          ⏳
                        </div>
                      ) : (
                        <Avatar name={student.name} size="sm" />
                      )}
                      <div>
                        <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {student.name}
                          {isPending && <Badge variant="neutral">Pending Activation</Badge>}
                        </div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-3)' }}>{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-2)' }}>
                      {student.register_number || <em style={{ opacity: 0.5 }}>-</em>}
                    </span>
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
                      {isPending ? 'Added ' + formatDate(student.enrolledAt) : (student.enrolledAt ? formatDate(student.enrolledAt) : 'No activity')}
                    </span>
                  </td>
                  <td>
                    {!isPending && student.reflectionsCount === 0 && <span className="roster__flag" title="Needs attention">⚑</span>}
                  </td>
                </tr>

                {isExpanded && (
                  <tr className="roster__detail">
                    <td colSpan={6}>
                      <div className="roster__detail-inner">
                        {/* Position evolution */}
                        <div>
                          <div className="roster__detail-section-title">Current Position</div>
                          {isPending ? (
                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-3)', fontStyle: 'italic' }}>
                              Waiting for student to create their account to join the dialogue.
                            </span>
                          ) : student.rightNowIThink ? (
                            <div className="roster__position">
                              "{student.rightNowIThink}"
                            </div>
                          ) : (
                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-3)', fontStyle: 'italic' }}>
                              No position set
                            </span>
                          )}
                        </div>

                        {/* Recent Activity Summary */}
                        <div>
                          <div className="roster__detail-section-title">Activity Summary</div>
                          <div className="roster__detail-list">
                             <div className="roster__detail-item">
                                <div className="roster__detail-item-meta">
                                  Total Reflections: {student.reflectionsCount}
                                </div>
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
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
