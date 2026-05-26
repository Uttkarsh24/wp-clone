import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronLeft, Save, FileText, Eye } from 'lucide-react';
import { useAuth, API_BASE } from '../../App';

function PageEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const isEditMode = !!id;

  // Form Fields State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('DRAFT');

  // Auxiliary State
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' | 'preview'
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      // Load page data
      fetch(`${API_BASE}/pages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          const page = data.find(p => p.id === parseInt(id));
          if (page) {
            setTitle(page.title);
            setSlug(page.slug);
            setContent(page.content);
            setStatus(page.status);
          } else {
            setError('Page not found.');
          }
        })
        .catch(err => {
          console.error(err);
          setError('Failed to load page data.');
        });
    }
  }, [id, isEditMode, token]);

  const handleEditorHelper = (tag) => {
    const textarea = document.getElementById('page-textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    let replacement = '';
    if (tag === 'b') replacement = `<strong>${selected || 'bold text'}</strong>`;
    else if (tag === 'i') replacement = `<em>${selected || 'italic text'}</em>`;
    else if (tag === 'h2') replacement = `<h2>${selected || 'Heading 2'}</h2>`;
    else if (tag === 'h3') replacement = `<h3>${selected || 'Heading 3'}</h3>`;
    else if (tag === 'quote') replacement = `<blockquote>\n  "${selected || 'quote text'}"\n</blockquote>`;
    else if (tag === 'list') replacement = `<ul>\n  <li>${selected || 'item 1'}</li>\n  <li>item 2</li>\n</ul>`;

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setContent(newContent);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 0);
  };

  const handleSave = () => {
    setError('');
    setSaving(true);

    if (!title || !content) {
      setError('Title and content are required.');
      setSaving(false);
      return;
    }

    const payload = {
      title,
      slug: slug || undefined,
      content,
      status
    };

    const url = isEditMode ? `${API_BASE}/pages/${id}` : `${API_BASE}/pages`;
    const method = isEditMode ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to save page');
        return data;
      })
      .then(() => {
        setSaving(false);
        navigate('/admin/pages');
      })
      .catch(err => {
        console.error(err);
        setError(err.message || 'Error occurred while saving page.');
        setSaving(false);
      });
  };

  return (
    <div style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      <div className="flex-between" style={{ marginBottom: '24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/admin/pages" className="btn btn-secondary" style={{ padding: '8px' }}>
            <ChevronLeft size={18} />
          </Link>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>
            {isEditMode ? 'Edit Page' : 'Add New Page'}
          </h1>
        </div>

        <button 
          onClick={handleSave} 
          className="btn btn-primary"
          disabled={saving}
        >
          <Save size={16} />
          <span>{saving ? 'Saving...' : 'Save Page'}</span>
        </button>
      </div>

      {error && (
        <div style={{ 
          padding: '12px 16px', 
          backgroundColor: 'rgba(239, 68, 68, 0.1)', 
          color: 'var(--danger)', 
          border: '1px solid rgba(239, 68, 68, 0.2)', 
          borderRadius: 'var(--radius-sm)',
          fontSize: '14px',
          marginBottom: '16px',
          flexShrink: 0
        }}>
          {error}
        </div>
      )}

      {/* Main Editing Canvas Grid */}
      <div className="editor-container">
        {/* Editor Body */}
        <div className="editor-canvas" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input 
            type="text" 
            placeholder="Add Page Title" 
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="editor-title-input"
            style={{ outline: 'none', border: 'none', background: 'none' }}
          />

          {/* Tab Selection */}
          <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            <button 
              onClick={() => setActiveTab('edit')} 
              style={{ 
                fontSize: '14px', 
                fontWeight: 600, 
                color: activeTab === 'edit' ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: activeTab === 'edit' ? '2px solid var(--primary)' : '2px solid transparent',
                padding: '4px 8px',
                cursor: 'pointer'
              }}
            >
              Write (HTML)
            </button>
            <button 
              onClick={() => setActiveTab('preview')} 
              style={{ 
                fontSize: '14px', 
                fontWeight: 600, 
                color: activeTab === 'preview' ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: activeTab === 'preview' ? '2px solid var(--primary)' : '2px solid transparent',
                padding: '4px 8px',
                cursor: 'pointer'
              }}
            >
              Visual Preview
            </button>
          </div>

          {activeTab === 'edit' ? (
            <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              {/* Text formatting helpers */}
              <div className="editor-toolbar">
                <button type="button" onClick={() => handleEditorHelper('h2')} className="editor-toolbar-btn">H2</button>
                <button type="button" onClick={() => handleEditorHelper('h3')} className="editor-toolbar-btn">H3</button>
                <button type="button" onClick={() => handleEditorHelper('b')} className="editor-toolbar-btn" style={{ fontWeight: 'bold' }}>B</button>
                <button type="button" onClick={() => handleEditorHelper('i')} className="editor-toolbar-btn" style={{ fontStyle: 'italic' }}>I</button>
                <button type="button" onClick={() => handleEditorHelper('quote')} className="editor-toolbar-btn">Quote</button>
                <button type="button" onClick={() => handleEditorHelper('list')} className="editor-toolbar-btn">Bullet List</button>
              </div>

              <textarea 
                id="page-textarea"
                placeholder="Start writing page content..."
                value={content}
                onChange={e => setContent(e.target.value)}
                className="editor-textarea"
                style={{ flexGrow: 1, outline: 'none', border: 'none', background: 'none' }}
              />
            </div>
          ) : (
            <div 
              className="entry-content" 
              style={{ flexGrow: 1, overflowY: 'auto', padding: '12px' }}
              dangerouslySetInnerHTML={{ __html: content || '<p style="color:var(--text-dark); font-style:italic;">No content to preview.</p>' }}
            />
          )}
        </div>

        {/* Sidebar Controls */}
        <aside className="editor-sidebar" style={{ height: 'fit-content' }}>
          {/* Status Settings */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Publish Status</h3>
            <select 
              value={status} 
              onChange={e => setStatus(e.target.value)} 
              className="form-control"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>

          {/* Slug URL */}
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>URL Slug</h3>
            <input 
              type="text" 
              placeholder="e.g. custom-page-path"
              value={slug}
              onChange={e => setSlug(e.target.value)}
              className="form-control"
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

export default PageEditorPage;
