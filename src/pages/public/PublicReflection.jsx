import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import './PublicPages.css';

export default function PublicReflection() {
  const { id } = useParams();
  const [reflection, setReflection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReflection() {
      const found = await api.getReflectionById(id);
      setReflection(found);
      setLoading(false);
    }
    fetchReflection();
  }, [id]);

  if (loading) {
    return <div className="public-essay-loading">Loading…</div>;
  }

  if (!reflection) {
    return (
      <div className="public-essay-layout">
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#888' }}>
          <h2>Not found</h2>
          <p>This reflection may be private or no longer available.</p>
        </div>
      </div>
    );
  }

  // Try to render blocks if content is JSON, otherwise render as plain text
  let paragraphs = [];
  try {
    const parsed = JSON.parse(reflection.content);
    paragraphs = Array.isArray(parsed) ? parsed.map(b => b.text).filter(Boolean) : [reflection.content];
  } catch {
    paragraphs = (reflection.content || '').split('\n\n').filter(Boolean);
  }

  return (
    <div className="public-essay-layout page-enter">
      <header className="public-essay-header">
        <h1 className="public-essay-title">{reflection.title || 'A Reflection'}</h1>
        <p className="public-essay-author">By {reflection.authorName}</p>
        <p className="public-essay-date">
          {formatDate(reflection.createdAt)}
        </p>
      </header>

      <article className="public-essay-body">
        {paragraphs.map((para, i) => (
          <p key={i} className="public-essay-paragraph">{para}</p>
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
