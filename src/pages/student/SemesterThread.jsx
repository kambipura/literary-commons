import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import Badge from '../../components/Badge';
import { api } from '../../lib/api';
import { AuthContext } from '../../context/AuthContext';
import { formatDate } from '../../lib/utils';
import './StudentPages.css';

export default function SemesterThread() {
  const { userId: paramId } = useParams();
  const { user: currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [timeline, setTimeline] = useState([]);


  const targetId = paramId || currentUser?.id;
  const isMe = targetId === currentUser?.id;
  const [courseId, setCourseId] = useState(null);

  useEffect(() => {
    async function fetchData() {
      if (!targetId) return;
      setLoading(true);

      try {
        // Discover course for session context
        let resolvedCourseId = courseId;
        if (!resolvedCourseId && currentUser) {
          const enrollments = await api.getMyEnrollments(currentUser.id);
          if (enrollments.length > 0) {
            resolvedCourseId = enrollments[0].id;
          } else {
            const courses = await api.getCourses();
            if (courses.length > 0) resolvedCourseId = courses[0].id;
          }
          if (resolvedCourseId) setCourseId(resolvedCourseId);
        }

        // Parallel fetch
        const [prof, refs, notes] = await Promise.all([
          api.getProfile(targetId),
          api.getReflections({ userId: targetId }),
          isMe ? api.getNotes(targetId) : Promise.resolve([]),
        ]);

        setProfile(prof);

        // Filter: if not viewing own thread, only show published reflections
        const reflections = refs
          .filter(r => isMe || r.status === 'published')
          .map(r => ({
            ...r,
            entryType: 'reflection',
            dateKey: r.createdAt || r.created_at,
          }));

        const myNotes = notes
          .filter(n => !n.isArchived)
          .map(n => ({
            ...n,
            entryType: 'note',
            dateKey: n.createdAt || n.created_at,
          }));

        const combined = [...reflections, ...myNotes]
          .sort((a, b) => new Date(a.dateKey) - new Date(b.dateKey));

        setTimeline(combined);
      } catch (err) {
        console.error('Thread fetch failed:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [targetId, isMe, currentUser?.id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', color: 'var(--ink-3)' }}>
        <p>Retrieving intellectual journey...</p>
      </div>
    );
  }


  return (
    <div className="thread">
      <div className="thread__header">
        <h2>{isMe ? 'My' : (profile?.name || 'Student') + "'s"} Semester Thread</h2>
        <p className="thread__subtitle">
          {isMe 
            ? "Everything you've written this semester, in the order you thought it."
            : "A chronological story of their shifting perspectives and inquiries."}
        </p>
      </div>

      <div className="thread__timeline">
        {timeline.length === 0 ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--ink-3)' }}>
            <p>No contributions found in local history yet.</p>
          </div>
        ) : (
          timeline.map((entry, i) => {
            return (
              <div
                key={entry.id}
                className="thread__entry"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="thread__entry-dot" />
                <div className="thread__entry-date">{formatDate(entry.dateKey)}</div>
                {entry.source && (
                  <div className="thread__entry-source">{entry.source}</div>
                )}
                <Link
                  to={entry.entryType === 'reflection' ? `/post/${entry.id}` : `/notebook/${entry.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <h4 className="thread__entry-title">{entry.title || (entry.entryType === 'note' ? 'Untitled Note' : 'Reflection')}</h4>
                </Link>
                <p className="thread__entry-position">
                  {(entry.content || '').split('\n')[0]?.slice(0, 150)}…
                </p>
                <div className="thread__entry-type">
                  {entry.entryType === 'reflection' ? (
                    <Badge type="custom" label={entry.status === 'draft' ? 'Draft' : 'Published'} size="sm" />
                  ) : (
                    <Badge type="note" variant={entry.type} size="sm" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
