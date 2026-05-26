import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { API_BASE } from '../App';

function PageDetail() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/pages/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Page not found');
        return res.json();
      })
      .then(data => {
        setPage(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <div className="container" style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Loading page...</div>;
  if (!page) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>The page you are looking for does not exist or may have been deleted.</p>
        <Link to="/" className="btn btn-primary">Back to Homepage</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '32px', fontSize: '15px' }}>
        <ChevronLeft size={16} /> Back to home
      </Link>

      <article style={{ marginBottom: '60px' }}>
        <h1 style={{ fontSize: '42px', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-1px', marginBottom: '32px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
          {page.title}
        </h1>

        <div 
          className="entry-content" 
          dangerouslySetInnerHTML={{ __html: page.content }} 
        />
      </article>
    </div>
  );
}

export default PageDetail;
