import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Card, { CardBody, CardFooter } from '../../components/Card';
import Badge from '../../components/Badge';
import Avatar from '../../components/Avatar';
import Button from '../../components/Button';
import { api } from '../../lib/api';
import { AuthContext } from '../../context/AuthContext';
import {
  getUser,
  getTheySayLabel,
  formatRelative,
} from '../../data/mock';
import './StudentPages.css';

const WELCOME_QUOTES = [
  { text: "There is no greater agony than bearing an untold story inside you.", author: "Maya Angelou" },
  { text: "We write to taste life twice, in the moment and in retrospect.", author: "Anaïs Nin" },
  { text: "A word after a word after a word is power.", author: "Margaret Atwood" },
  { text: "The role of a writer is not to say what we all can say, but what we are unable to say.", author: "Anaïs Nin" }
];

export default function StudentDashboard() {
  const { user } = useContext(AuthContext);
  const [welcomeQuote] = useState(() => WELCOME_QUOTES[Math.floor(Math.random() * WELCOME_QUOTES.length)]);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    session: null,
    mySessionReflections: [],
    recentItem: null,
    recentDraft: null,
    randomClassmate: null,
  });

  useEffect(() => {
    async function fetchData() {
      if (!user?.id) return;
      const userId = user.id; 
      
      try {
        // 1. Get the first relevant course (enrolled or created)
        let courseId = null;
        const enrollments = await api.getMyEnrollments(userId);
        if (enrollments.length > 0) {
          courseId = enrollments[0].id;
        } else {
          // Fallback for Admin/Professor testing student view
          const allCourses = await api.getCourses();
          if (allCourses.length > 0) courseId = allCourses[0].id;
        }

        if (!courseId) {
          setLoading(false);
          return;
        }

        const [currSession, allMyRefs, allNotes, allPublished] = await Promise.all([
          api.getCurrentSession(courseId),
          api.getReflections({ userId }),
          api.getNotes(userId),
          api.getReflections({ status: 'published' })
        ]);

        // Filter current session reflections
        const sessionRefs = allMyRefs.filter(r => r.sessionId === currSession?.id);
        
        // Recent work logic
        const drafts = allMyRefs.filter(r => r.status === 'draft')
          .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
        
        const recentNote = allNotes.filter(n => !n.isArchived)
          .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))[0];
        
        const recentDraft = drafts[0];
        const recentItem = recentDraft || recentNote;

        // Classmate post
        const classmateRefs = allPublished.filter(r => r.userId !== userId);
        const random = classmateRefs.length > 0 
          ? classmateRefs[Math.floor(Math.random() * classmateRefs.length)]
          : null;

        setDashboardData({
          session: currSession,
          mySessionReflections: sessionRefs,
          recentItem,
          recentDraft,
          randomClassmate: random
        });
      } catch (err) {
        console.error('Dashboard fetch failed:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user?.id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', color: 'var(--ink-3)' }}>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  const { session, mySessionReflections, recentItem, recentDraft, randomClassmate } = dashboardData;
  const hasWritten = mySessionReflections.length > 0;

  // Safe user lookup
  const getSafeName = (uid) => {
    if (!uid) return 'Student';
    const profile = getUser(uid);
    return profile?.name || 'Student';
  };

  return (
    <div className="dashboard page-enter">
      {/* Welcome Quote */}
      <div style={{ marginBottom: 'var(--space-8)', textAlign: 'center', opacity: 0.8, maxWidth: '600px', margin: '0 auto var(--space-8) auto' }}>
        <p style={{ fontFamily: 'var(--font-heading)', fontStyle: 'italic', fontSize: 'var(--text-xl)', color: 'var(--ink)', lineHeight: '1.4' }}>"{welcomeQuote.text}"</p>
        <p className="meta" style={{ marginTop: 'var(--space-3)' }}>— {welcomeQuote.author}</p>
      </div>

      {/* Session prompt */}
      {session && session.title ? (
        <section className="dashboard__section">
          <div className="dashboard__session-card">
            <div className="dashboard__session-meta">
              <Badge type="move" variant="they-say" />
              <span className="meta">Session {session.number}</span>
            </div>
            <h2 className="dashboard__session-title">{session.title}</h2>
            <p className="dashboard__session-prompt">{session.theySayPrompt}</p>
            {(!hasWritten || recentDraft) ? (
              <div className="dashboard__nudge">
                <span className="dashboard__nudge-text">
                  {recentDraft 
                    ? "You have a draft for this session."
                    : "You haven't written for this session yet."}
                </span>
                <Link to="/write">
                  <Button size="sm">
                    {recentDraft ? 'Resume Response' : 'Respond'}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="dashboard__written">
                <span className="meta">✓ you've written {mySessionReflections.length} reflection{mySessionReflections.length > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </section>
      ) : (
        <div className="dashboard__empty-session" style={{ textAlign: 'center', padding: 'var(--space-8)', background: 'var(--paper-2)', borderRadius: 'var(--radius-lg)' }}>
          <p className="meta">There are no active sessions yet.</p>
        </div>
      )}

      {/* Recent work */}
      {recentItem && (
        <section className="dashboard__section">
          <h3 className="dashboard__section-title">Where you left off</h3>
          <Link
            to={recentDraft ? `/write` : '/notebook'}
            className="dashboard__recent-link"
          >
            <Card hoverable padding="md">
              <CardBody>
                <div className="dashboard__recent-meta">
                  {recentDraft ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <Badge type="custom" label="Draft" />
                      <button 
                        onClick={async (e) => {
                          e.preventDefault();
                          if (confirm('Delete this draft permanently?')) {
                            await api.deleteReflection(recentDraft.id);
                            window.location.reload();
                          }
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--error)', fontSize: '10px', cursor: 'pointer', opacity: 0.6 }}
                      >
                        Delete Draft
                      </button>
                    </div>
                  ) : (
                    <Badge type="note" variant={recentItem.type} />
                  )}
                  <span className="meta">{formatRelative(recentItem.updatedAt || new Date().toISOString())}</span>
                </div>
                <h4 className="dashboard__recent-title">
                  {recentItem.title || 'Untitled'}
                </h4>
                <p className="dashboard__recent-preview">
                  {(recentItem.content || recentItem.iSay || recentItem.response || '')
                    .slice(0, 150)}…
                </p>
              </CardBody>
            </Card>
          </Link>
        </section>
      )}

      {/* Classmate invitation */}
      {randomClassmate && (
        <section className="dashboard__section">
          <h3 className="dashboard__section-title">From the conversation</h3>
          <Card padding="md" variant="bordered">
            <CardBody>
              <div className="dashboard__classmate-header">
                <Avatar name={getSafeName(randomClassmate.userId)} size="sm" />
                <div>
                  <span className="dashboard__classmate-name">
                    {getSafeName(randomClassmate.userId)}
                  </span>
                  <span className="meta"> · {formatRelative(randomClassmate.createdAt)}</span>
                </div>
              </div>
              <h4 className="dashboard__classmate-title">
                {randomClassmate.title}
              </h4>
              <p className="dashboard__classmate-preview">
                {randomClassmate.content.slice(0, 200)}…
              </p>
            </CardBody>
            <CardFooter>
              <Link to={`/post/${randomClassmate.id}`}>
                <Button variant="ghost" size="sm">
                  Read & respond →
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </section>
      )}
    </div>
  );
}
