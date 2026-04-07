import { useState } from 'react';
import Avatar from '../../components/Avatar';
import {
  sessions, currentSession, reflections, comments, reactions,
  course, users, getUser, getCourseParticipation,
} from '../../data/mock';
import './ProfessorPages.css';

export default function ParticipationTracker() {
  const participation = getCourseParticipation();

  // Build activity matrix: student × session
  const matrix = course.studentIds.map(sid => {
    const user = getUser(sid);
    const sessionActivity = sessions.map(session => {
      const hasReflection = reflections.some(
        r => r.userId === sid && r.sessionId === session.id && r.status === 'published'
      );
      const hasComment = comments.some(c => {
        const ref = reflections.find(r => r.id === c.reflectionId);
        return c.userId === sid && ref?.sessionId === session.id;
      });
      const hasReaction = reactions.some(rx => {
        const ref = reflections.find(r => r.id === rx.reflectionId);
        return rx.userId === sid && ref?.sessionId === session.id;
      });

      if (hasReflection) return 'full';
      if (hasComment || hasReaction) return 'partial';
      return 'empty';
    });

    // Word count trend
    const refsBySess = sessions.map(s =>
      reflections
        .filter(r => r.userId === sid && r.sessionId === s.id && r.status === 'published')
        .reduce((sum, r) => sum + r.content.split(/\s+/).length, 0)
    ).filter(wc => wc > 0);
    
    let trend = 'stable';
    if (refsBySess.length >= 2) {
      const last = refsBySess[refsBySess.length - 1];
      const prev = refsBySess[refsBySess.length - 2];
      if (last > prev * 1.1) trend = 'growing';
      else if (last < prev * 0.9) trend = 'declining';
    }

    return {
      studentId: sid,
      name: user?.name || 'Unknown',
      activity: sessionActivity,
      trend,
    };
  });

  // Nudge list: students who only reacted but haven't written for active session
  const nudgeStudents = course.studentIds
    .map(sid => {
      const hasWritten = reflections.some(
        r => r.userId === sid && r.sessionId === currentSession.id && r.status === 'published'
      );
      const hasReacted = reactions.some(rx => {
        const ref = reflections.find(r => r.id === rx.reflectionId);
        return rx.userId === sid && ref?.sessionId === currentSession.id;
      });
      const hasCommented = comments.some(c => {
        const ref = reflections.find(r => r.id === c.reflectionId);
        return c.userId === sid && ref?.sessionId === currentSession.id;
      });

      if (!hasWritten && (hasReacted || hasCommented)) {
        return { studentId: sid, name: getUser(sid)?.name, reason: 'Reacted/commented but hasn\'t written' };
      }
      if (!hasWritten && !hasReacted && !hasCommented) {
        return { studentId: sid, name: getUser(sid)?.name, reason: 'No activity for current session' };
      }
      return null;
    })
    .filter(Boolean);

  // Voice diversity per session
  const voiceDiversity = sessions.map(s => ({
    session: s,
    voices: new Set(
      reflections
        .filter(r => r.sessionId === s.id && r.status === 'published')
        .map(r => r.userId)
    ).size,
  }));

  const trendIcon = (t) => t === 'growing' ? '↑' : t === 'declining' ? '↓' : '→';
  const trendColor = (t) => t === 'growing' ? 'var(--success)' : t === 'declining' ? 'var(--error)' : 'var(--ink-3)';

  return (
    <div className="participation">
      <div className="participation__header">
        <h2>Participation</h2>
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          {voiceDiversity.map(v => (
            <div key={v.session.id} style={{ textAlign: 'center' }}>
              <div className="meta">S{v.session.number}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                {v.voices}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity matrix */}
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
              {matrix.map(row => (
                <tr key={row.studentId}>
                  <td>{row.name}</td>
                  {row.activity.map((cell, i) => (
                    <td key={i}>
                      <span className={`participation__cell participation__cell--${cell}`} title={cell} />
                    </td>
                  ))}
                  <td>
                    <span style={{ color: trendColor(row.trend), fontWeight: 600 }}>
                      {trendIcon(row.trend)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--ink-3)', marginTop: 'var(--space-2)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            <span className="participation__cell participation__cell--full" style={{ width: 14, height: 14 }} /> Wrote reflection
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            <span className="participation__cell participation__cell--partial" style={{ width: 14, height: 14 }} /> Comment/reaction only
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            <span className="participation__cell participation__cell--empty" style={{ width: 14, height: 14 }} /> No activity
          </span>
        </div>
      </section>

      {/* Totals */}
      <section>
        <div className="prof-section-title" style={{ marginTop: 'var(--space-8)' }}>
          <span>Totals</span>
          <span className="prof-section-line" />
        </div>
        <div className="participation__totals-grid">
          {participation.map(p => (
            <div key={p.studentId} className="participation__total-card">
              <div className="participation__total-name">{p.name}</div>
              <div className="participation__total-stats">
                <span><span className="participation__total-stat-value">{p.reflectionsCount}</span> reflections</span>
                <span><span className="participation__total-stat-value">{p.commentsCount}</span> comments</span>
                <span><span className="participation__total-stat-value">{p.reactionsCount}</span> reactions</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Nudge list */}
      {nudgeStudents.length > 0 && (
        <section>
          <div className="prof-section-title" style={{ marginTop: 'var(--space-8)' }}>
            <span>Nudge List</span>
            <span className="prof-section-line" />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-3)' }}>
              Session {currentSession.number}
            </span>
          </div>
          <div className="participation__nudge-list">
            {nudgeStudents.map(s => (
              <div key={s.studentId} className="participation__nudge-item">
                <Avatar name={s.name} size="sm" />
                <span className="participation__nudge-name">{s.name}</span>
                <span className="participation__nudge-reason">{s.reason}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
