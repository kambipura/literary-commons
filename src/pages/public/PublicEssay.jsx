import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import './PublicPages.css';

export default function PublicEssay() {
  const { id } = useParams();
  const [essay, setEssay] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEssay() {
      const found = await api.getEssayById(id);
      setEssay(found);
      setLoading(false);
    }
    fetchEssay();
  }, [id]);

  if (loading) {
    return <div className="public-essay-loading">Loading essay…</div>;
  }

  if (!essay) {
    return (
      <div className="public-essay-layout">
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#888' }}>
          <h2>Essay not found</h2>
          <p>This essay may be private or no longer available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="public-essay-layout page-enter">
      <header className="public-essay-header">
        <h1 className="public-essay-title">{essay.title || 'Untitled Essay'}</h1>
        <p className="public-essay-author">By {essay.authorName}</p>
        <p className="public-essay-date">
          Published {new Date(essay.updatedAt).toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric'
          })}
        </p>
      </header>

      <article className="public-essay-body">
        {essay.sections?.map((sec, i) => (
          <p key={sec.id || i} className="public-essay-paragraph">
            {sec.text || sec.content || ''}
          </p>
        ))}
      </article>

      <div className="public-essay-actions" style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
        <button className="btn-ghost" onClick={() => window.print()}>
          Download as PDF
        </button>
      </div>

      <div className="public-essay-brand">
        <p>Published on <strong>The Literary Commons</strong></p>
      </div>
    </div>
  );
}
