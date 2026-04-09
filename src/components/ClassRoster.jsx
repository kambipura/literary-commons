import React from 'react';
import { Link } from 'react-router-dom';
import Avatar from './Avatar';
import Badge from './Badge';

/**
 * ClassRoster
 * 
 * Displays a list of classmates with their activity stats.
 * Allows navigating to their intellectual journey threads.
 */
export default function ClassRoster({ students = [], loading = false, currentUserId }) {
  if (loading) {
    return (
      <div className="class-roster class-roster--loading">
        <p className="meta">Loading class circle...</p>
      </div>
    );
  }

  // Filter out pending and self? Or maybe keep self at the top?
  const sortedStudents = [...students].sort((a, b) => {
    if (a.id === currentUserId) return -1;
    if (b.id === currentUserId) return 1;
    return (a.name || '').localeCompare(b.name || '');
  });

  return (
    <div className="class-roster">
      <div className="class-roster__header">
        <h3 className="class-roster__title">Class Circle</h3>
        <span className="meta">{students.length} members</span>
      </div>

      <div className="class-roster__list">
        {sortedStudents.map(student => {
          const isMe = student.id === currentUserId;
          const isPending = student.isPending;

          return (
            <Link 
              key={student.id} 
              to={isMe ? '/thread' : `/thread/${student.id}`}
              className={`class-roster__item ${isPending ? 'class-roster__item--pending' : ''}`}
            >
              <Avatar name={student.name} size="sm" src={student.avatar_url} />
              <div className="class-roster__item-info">
                <span className="class-roster__item-name">
                  {student.name} {isMe && <span className="meta">(You)</span>}
                </span>
                {!isPending && (
                  <div className="class-roster__item-stats">
                    <span className="meta">{student.reflectionsCount || 0} posts</span>
                    <span className="meta">·</span>
                    <span className="meta">{student.commentsCount || 0} comments</span>
                  </div>
                )}
                {isPending && (
                  <span className="meta" style={{ fontStyle: 'italic' }}>Pending invite</span>
                )}
              </div>
              {student.reflectionsCount > 5 && !isPending && (
                <Badge type="custom" label="Active" size="sm" variant="accent" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
