import React, { useState, useEffect } from 'react';
import { Trash2, Check, X, MessageSquare } from 'lucide-react';
import { useAuth, API_BASE } from '../../App';

function CommentsModerator() {
  const { token } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = () => {
    setLoading(true);
    fetch(`${API_BASE}/comments`, {
      headers: { 'Authorization': `Bearer ${token}` }
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
  };

  useEffect(() => {
    fetchComments();
  }, [token]);

  const handleModerate = (id, approve) => {
    const status = approve ? 'APPROVED' : 'PENDING';

    fetch(`${API_BASE}/comments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    })
      .then(res => {
        if (!res.ok) throw new Error('Moderation failed');
        fetchComments();
      })
      .catch(err => console.error(err));
  };

  const handleDeleteComment = (id) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    fetch(`${API_BASE}/comments/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Delete failed');
        fetchComments();
      })
      .catch(err => console.error(err));
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Comments</h1>
          <p style={{ color: 'var(--text-muted)' }}>Moderate visitor discussions and comments left on your posts.</p>
        </div>
      </div>

      <div className="glass" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading comments...</div>
        ) : comments.length === 0 ? (
          <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No comments found. Discussion replies will appear here.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}>
                <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>Author</th>
                <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>Comment</th>
                <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>Related Post</th>
                <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((comment) => (
                <tr key={comment.id} style={{ borderBottom: '1px solid var(--border)', transition: 'var(--transition)' }} className="table-row-hover">
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ fontSize: '14px' }}>{comment.authorName}</strong>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{comment.authorEmail}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-dark)', marginTop: '4px' }}>
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text-main)', maxWidth: '300px' }}>
                    <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{comment.content}</p>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '14px' }}>
                    <a href={`/post/${comment.post?.slug}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 500 }}>
                      {comment.post?.title}
                    </a>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: 600, 
                      padding: '4px 8px', 
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: comment.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: comment.status === 'APPROVED' ? 'var(--success)' : 'var(--warning)'
                    }}>
                      {comment.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      {comment.status === 'PENDING' ? (
                        <button 
                          onClick={() => handleModerate(comment.id, true)} 
                          className="btn btn-secondary" 
                          style={{ padding: '6px', borderRadius: '4px', color: 'var(--success)' }}
                          title="Approve"
                        >
                          <Check size={14} />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleModerate(comment.id, false)} 
                          className="btn btn-secondary" 
                          style={{ padding: '6px', borderRadius: '4px', color: 'var(--warning)' }}
                          title="Unapprove"
                        >
                          <X size={14} />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteComment(comment.id)} 
                        className="btn btn-danger" 
                        style={{ padding: '6px', borderRadius: '4px' }}
                        title="Delete"
                      >
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

export default CommentsModerator;
