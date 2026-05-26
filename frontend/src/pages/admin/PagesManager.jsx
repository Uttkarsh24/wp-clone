import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, FileText, Eye } from 'lucide-react';
import { useAuth, API_BASE } from '../../App';

function PagesManager() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPages = () => {
    setLoading(true);
    fetch(`${API_BASE}/pages`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setPages(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPages();
  }, [token]);

  const handleDeletePage = (id) => {
    if (!window.confirm('Are you sure you want to delete this page?')) return;

    fetch(`${API_BASE}/pages/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to delete');
        fetchPages();
      })
      .catch(err => console.error(err));
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Pages</h1>
          <p style={{ color: 'var(--text-muted)' }}>Create and manage custom static pages for your site layout.</p>
        </div>
        <Link to="/admin/pages/new" className="btn btn-primary">
          <Plus size={18} />
          <span>Add New Page</span>
        </Link>
      </div>

      <div className="glass" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading pages...</div>
        ) : pages.length === 0 ? (
          <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No pages found. Start by creating your first page!
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}>
                <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>Title</th>
                <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>URL Path</th>
                <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>Date Created</th>
                <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id} style={{ borderBottom: '1px solid var(--border)', transition: 'var(--transition)' }} className="table-row-hover">
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ fontWeight: 600, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={16} style={{ color: 'var(--primary)' }} />
                      {page.title}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text-muted)' }}>/{page.slug}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: 600, 
                      padding: '4px 8px', 
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: page.status === 'PUBLISHED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: page.status === 'PUBLISHED' ? 'var(--success)' : 'var(--warning)'
                    }}>
                      {page.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    {new Date(page.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <Link to={`/${page.slug}`} target="_blank" className="btn btn-secondary" style={{ padding: '6px', borderRadius: '4px' }} title="Preview">
                        <Eye size={14} />
                      </Link>
                      <button onClick={() => navigate(`/admin/pages/edit/${page.id}`)} className="btn btn-secondary" style={{ padding: '6px', borderRadius: '4px' }} title="Edit">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDeletePage(page.id)} className="btn btn-danger" style={{ padding: '6px', borderRadius: '4px' }} title="Delete">
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

export default PagesManager;
