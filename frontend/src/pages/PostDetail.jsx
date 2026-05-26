import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, Folder, MessageSquare, ChevronLeft, Send } from 'lucide-react';
import { API_BASE } from '../App';

function PostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Comment Form State
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [commentSubmitted, setCommentSubmitted] = useState(false);
  const [commentError, setCommentError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/posts/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Post not found');
        return res.json();
      })
      .then(data => {
        setPost(data);
        // Fetch comments for this post
        return fetch(`${API_BASE}/comments/post/${data.id}`);
      })
      .then(res => res.json())
      .then(data => {
        setComments(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    setCommentError('');

    if (!commentName || !commentEmail || !commentContent) {
      setCommentError('All comment fields are required.');
      return;
    }

    fetch(`${API_BASE}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        authorName: commentName,
        authorEmail: commentEmail,
        content: commentContent,
        postId: post.id
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to submit comment');
        return res.json();
      })
      .then(() => {
        setCommentSubmitted(true);
        setCommentName('');
        setCommentEmail('');
        setCommentContent('');
      })
      .catch(err => {
        console.error(err);
        setCommentError('Failed to submit comment. Please try again.');
      });
  };

  if (loading) return <div className="container" style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Loading article...</div>;
  if (!post) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>Article Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>The post you are looking for may have been deleted or draft status changed.</p>
        <Link to="/" className="btn btn-primary">Back to Homepage</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '32px', fontSize: '15px' }}>
        <ChevronLeft size={16} /> Back to articles
      </Link>

      <article style={{ marginBottom: '60px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <User size={16} /> {post.author.username}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={16} /> {new Date(post.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
          </span>
          {post.category && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)' }}>
              <Folder size={16} /> {post.category.name}
            </span>
          )}
        </div>

        <h1 style={{ fontSize: '42px', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-1px', marginBottom: '32px' }}>
          {post.title}
        </h1>

        {post.featuredImage && (
          <div style={{ width: '100%', height: '400px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '40px', border: '1px solid var(--border)' }}>
            <img src={`http://localhost:5000${post.featuredImage}`} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        <div 
          className="entry-content" 
          dangerouslySetInnerHTML={{ __html: post.content }} 
        />

        <div style={{ display: 'flex', gap: '8px', marginTop: '40px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
          {post.tags.map(tag => (
            <Link key={tag.id} to={`/?tag=${tag.slug}`} style={{ fontSize: '13px', padding: '6px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              #{tag.name}
            </Link>
          ))}
        </div>
      </article>

      {/* Comments Section */}
      <section style={{ borderTop: '1px solid var(--border)', paddingTop: '48px', marginBottom: '48px' }}>
        <h3 style={{ fontSize: '22px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
          <MessageSquare size={20} />
          Comments ({comments.length})
        </h3>

        {/* Comment Listing */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '48px' }}>
          {comments.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No comments yet. Be the first to share your thoughts!</p>
          ) : (
            comments.map(c => (
              <div key={c.id} className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div className="flex-between" style={{ marginBottom: '12px' }}>
                  <span style={{ fontWeight: 600, fontSize: '15px' }}>{c.authorName}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-dark)' }}>
                    {new Date(c.createdAt).toLocaleDateString(undefined, { dateStyle: 'short' })}
                  </span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>{c.content}</p>
              </div>
            ))
          )}
        </div>

        {/* Submit Comment Box */}
        <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Leave a Reply</h4>

          {commentSubmitted ? (
            <div style={{ padding: '16px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--radius-sm)' }}>
              Thank you! Your comment has been submitted and is currently pending administrator moderation.
            </div>
          ) : (
            <form onSubmit={handleCommentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {commentError && (
                <div style={{ color: 'var(--danger)', fontSize: '14px' }}>{commentError}</div>
              )}
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Name *</label>
                  <input 
                    type="text" 
                    value={commentName} 
                    onChange={e => setCommentName(e.target.value)} 
                    className="form-control" 
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Email *</label>
                  <input 
                    type="email" 
                    value={commentEmail} 
                    onChange={e => setCommentEmail(e.target.value)} 
                    className="form-control" 
                    placeholder="jane@example.com"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Comment *</label>
                <textarea 
                  rows={5} 
                  value={commentContent} 
                  onChange={e => setCommentContent(e.target.value)} 
                  className="form-control" 
                  placeholder="Share your thoughts..."
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '12px 24px' }}>
                <Send size={16} />
                <span>Submit Comment</span>
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

export default PostDetail;
