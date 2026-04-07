import Avatar from '../../components/Avatar';
import EmptyState from '../../components/EmptyState';
import {
  peerRecommendations, currentUserId, getUser, formatDate,
} from '../../data/mock';
import './StudentPages.css';

export default function PeerLinks() {
  const myRecs = peerRecommendations.filter(r => r.toUserId === currentUserId);

  return (
    <div className="peer-links">
      <div className="peer-links__header">
        <h2>Link Recommendations</h2>
        <p className="peer-links__subtitle">
          Links your classmates thought you'd care about.
        </p>
      </div>

      {myRecs.length === 0 ? (
        <EmptyState
          type="generic"
          title="No recommendations yet"
          body="When a classmate finds something that reminds them of your thinking, it will appear here."
        />
      ) : (
        myRecs.map(rec => {
          const from = getUser(rec.fromUserId);
          return (
            <div key={rec.id} className="peer-links__item">
              <div className="peer-links__item-header">
                <Avatar name={from?.name} size="sm" />
                <span className="peer-links__item-from">{from?.name}</span>
                <span className="meta">{formatDate(rec.createdAt)}</span>
                {!rec.isRead && <span className="peer-links__item-unread" />}
              </div>
              <a
                href={rec.url}
                target="_blank"
                rel="noopener noreferrer"
                className="peer-links__item-title"
              >
                {rec.title} ↗
              </a>
              <p className="peer-links__item-note">
                "{rec.note}"
              </p>
            </div>
          );
        })
      )}
    </div>
  );
}
