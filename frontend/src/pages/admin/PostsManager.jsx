import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Calendar, Folder, Tag, Eye } from 'lucide-react';
import { useAuth, API_BASE } from '../../App';

function PostsManager() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = () => {
    setLoading(true);
    fetch(`${API_BASE}/posts`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setPosts(data.posts || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPosts();
  }, [token]);

  const handleDeletePost = (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    fetch(`${API_BASE}/posts/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to delete');
        fetchPosts();
      })
      .catch(err => console.error(err));
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Posts</h1>
          <p style={{ color: 'var(--text-muted)' }}>Create, edit, or delete articles on your site.</p>
        </div>
        <Link to="/admin/posts/new" className="btn btn-primary">
          <Plus size={18} />
          <span>Add New Post</span>
        </Link>
      </div>

      <div className="glass" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading posts...</div>
        ) : posts.length === 0 ? (
          <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No posts found. Start by writing your first article!
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}>
                <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>Title</th>
                <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>Author</th>
                <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>Category</th>
                <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>Date</th>
                <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} style={{ borderBottom: '1px solid var(--border)', transition: 'var(--transition)' }} className="table-row-hover">
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600, fontSize: '15px' }}>{post.title}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-dark)' }}>/{post.slug}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text-muted)' }}>{post.author.username}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px' }}>
                    {post.category ? (
                      <span style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Folder size={12} /> {post.category.name}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-dark)' }}>Uncategorized</span>
                    )}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: 600, 
                      padding: '4px 8px', 
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: post.status === 'PUBLISHED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: post.status === 'PUBLISHED' ? 'var(--success)' : 'var(--warning)'
                    }}>
                      {post.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <Link to={`/post/${post.slug}`} target="_blank" className="btn btn-secondary" style={{ padding: '6px', borderRadius: '4px' }} title="Preview">
                        <Eye size={14} />
                      </Link>
                      <button onClick={() => navigate(`/admin/posts/edit/${post.id}`)} className="btn btn-secondary" style={{ padding: '6px', borderRadius: '4px' }} title="Edit">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDeletePost(post.id)} className="btn btn-danger" style={{ padding: '6px', borderRadius: '4px' }} title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default PostsManager;
