import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, Edit2, Image, MessageSquare, Plus, ArrowRight, Check, X, ClipboardList
} from 'lucide-react';
import { useAuth, API_BASE } from '../../App';

function DashboardOverview() {
  const { token } = useAuth();
  const navigate = useNavigate();

  // Statistics State
  const [stats, setStats] = useState({
    posts: 0,
    pages: 0,
    comments: 0,
    media: 0
  });

  // Recent Items State
  const [recentPosts, setRecentPosts] = useState([]);
  const [recentComments, setRecentComments] = useState([]);

  // Quick Draft State
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [draftSuccess, setDraftSuccess] = useState(false);
  const [draftError, setDraftError] = useState('');

  const fetchStats = () => {
    // 1. Fetch Posts count
    fetch(`${API_BASE}/posts?limit=1`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setStats(prev => ({ ...prev, posts: data.pagination?.total || 0 }));
        setRecentPosts((data.posts || []).slice(0, 3));
      });

    // 2. Fetch Pages count
    fetch(`${API_BASE}/pages`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setStats(prev => ({ ...prev, pages: data.length || 0 })));

    // 3. Fetch Comments count
    fetch(`${API_BASE}/comments`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setStats(prev => ({ ...prev, comments: data.length || 0 }));
        setRecentComments(data.slice(0, 3));
      });

    // 4. Fetch Media count
    fetch(`${API_BASE}/media`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setStats(prev => ({ ...prev, media: data.length || 0 })));
  };

  useEffect(() => {
    fetchStats();
  }, [token]);

  const handleQuickDraftSubmit = (e) => {
    e.preventDefault();
    setDraftError('');
    setDraftSuccess(false);

    if (!draftTitle || !draftContent) {
      setDraftError('Title and content are required.');
      return;
    }

    fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: draftTitle,
        content: draftContent,
        status: 'DRAFT'
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to create draft');
        return res.json();
      })
      .then(() => {
        setDraftSuccess(true);
        setDraftTitle('');
        setDraftContent('');
        fetchStats(); // Update stats & recent posts
      })
      .catch(err => {
        console.error(err);
        setDraftError('Could not save quick draft.');
      });
  };

  const handleCommentApproval = (id, approve) => {
    const status = approve ? 'APPROVED' : 'PENDING';
    fetch(`${API_BASE}/comments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    })
      .then(res => res.json())
      .then(() => fetchStats());
  };

  const statCards = [
    { label: 'Published & Draft Posts', value: stats.posts, icon: <Edit2 size={24} />, color: '#6366f1', link: '/admin/posts' },
    { label: 'Static Pages', value: stats.pages, icon: <FileText size={24} />, color: '#10b981', link: '/admin/pages' },
    { label: 'Pending & Mod Comments', value: stats.comments, icon: <MessageSquare size={24} />, color: '#f59e0b', link: '/admin/comments' },
    { label: 'Uploaded Media Assets', value: stats.media, icon: <Image size={24} />, color: '#ec4899', link: '/admin/media' }
  ];

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome to your site management panel.</p>
        </div>
        <Link to="/admin/posts/new" className="btn btn-primary">
          <Plus size={18} />
          <span>Write Post</span>
        </Link>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginBottom: '40px' }}>
        {statCards.map((card, idx) => (
          <div key={idx} className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid var(--border)' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '50px', 
              height: '50px', 
              borderRadius: 'var(--radius-sm)', 
              backgroundColor: `${card.color}15`, 
              color: card.color 
            }}>
              {card.icon}
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '28px', fontWeight: 800 }}>{card.value}</span>
              <Link to={card.link} style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {card.label} <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px' }}>
        {/* Left Side: Recent Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Recent Posts Panel */}
          <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Recent Posts</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {recentPosts.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No posts found.</p>
              ) : (
                recentPosts.map(post => (
                  <div key={post.id} className="flex-between" style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: 600 }}>{post.title}</h4>
                      <span style={{ fontSize: '12px', color: 'var(--text-dark)' }}>
                        {new Date(post.createdAt).toLocaleDateString()} &middot; {post.status}
                      </span>
                    </div>
                    <Link to={`/admin/posts/edit/${post.id}`} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                      Edit
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Comments Panel */}
          <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Recent Comments</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {recentComments.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No comments requiring moderation.</p>
              ) : (
                recentComments.map(comment => (
                  <div key={comment.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                    <div className="flex-between">
                      <div>
                        <strong style={{ fontSize: '14px' }}>{comment.authorName}</strong>
                        <span style={{ fontSize: '12px', color: 'var(--text-dark)', marginLeft: '8px' }}>
                          on {comment.post?.title}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {comment.status === 'PENDING' ? (
                          <button 
                            onClick={() => handleCommentApproval(comment.id, true)} 
                            className="btn btn-secondary" 
                            style={{ padding: '4px', color: 'var(--success)' }}
                            title="Approve"
                          >
                            <Check size={14} />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleCommentApproval(comment.id, false)} 
                            className="btn btn-secondary" 
                            style={{ padding: '4px', color: 'var(--warning)' }}
                            title="Unapprove"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Quick Draft */}
        <div>
          <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', position: 'sticky', top: '100px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ClipboardList size={18} />
              Quick Draft
            </h3>
            
            <form onSubmit={handleQuickDraftSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {draftSuccess && (
                <div style={{ padding: '10px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}>
                  Draft saved successfully!
                </div>
              )}
              {draftError && (
                <div style={{ color: 'var(--danger)', fontSize: '13px' }}>{draftError}</div>
              )}

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Title</label>
                <input 
                  type="text" 
                  value={draftTitle} 
                  onChange={e => setDraftTitle(e.target.value)} 
                  className="form-control" 
                  placeholder="Draft title..."
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">What's on your mind?</label>
                <textarea 
                  rows={4} 
                  value={draftContent} 
                  onChange={e => setDraftContent(e.target.value)} 
                  className="form-control" 
                  placeholder="Start writing ideas here..."
                  style={{ resize: 'none' }}
                />
              </div>

              <button type="submit" className="btn btn-secondary" style={{ padding: '10px' }}>
                Save Draft
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardOverview;
