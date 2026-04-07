import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { essays, getUserName, notes, reflections } from '../../data/mock';
import './PublicPages.css';

export default function PublicEssay() {
  const { id } = useParams();
  const [essay, setEssay] = useState(null);

  useEffect(() => {
    // In Phase 8, this will be a Supabase query:
    // supabase.from('essays').select('*, users(name)').eq('id', id).single()
    const found = essays.find(e => e.id === id) || essays[0]; // fallback to first essay for testing
    setEssay(found);
  }, [id]);

  if (!essay) {
    return <div className="public-essay-loading">Loading essay...</div>;
  }

  return (
    <div className="public-essay-layout page-enter">
      <header className="public-essay-header">
        <h1 className="public-essay-title">{essay.title || 'Untitled Essay'}</h1>
        <p className="public-essay-author">By {getUserName(essay.userId)}</p>
        <p className="public-essay-date">Published {new Date(essay.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric'})}</p>
      </header>

      <article className="public-essay-body">
        {essay.sections?.map(sec => (
          <p key={sec.id} className="public-essay-paragraph">
            {sec.content || "[Content derived from internal scaffold...]"}
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
