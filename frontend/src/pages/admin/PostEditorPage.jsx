import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ChevronLeft, Save, FileText, Image as ImageIcon, Eye, Plus, FolderPlus, Check 
} from 'lucide-react';
import { useAuth, API_BASE } from '../../App';

function PostEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const isEditMode = !!id;

  // Form Fields State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');

  // Auxiliary State
  const [categories, setCategories] = useState([]);
  const [mediaList, setMediaList] = useState([]);
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' | 'preview'
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Category Inline Add State
  const [newCatName, setNewCatName] = useState('');
  const [showCatForm, setShowCatForm] = useState(false);

  // Image Selector Modal
  const [showMediaModal, setShowMediaModal] = useState(false);

  useEffect(() => {
    // Fetch categories and media library
    fetch(`${API_BASE}/categories`)
      .then(res => res.json())
      .then(data => setCategories(data || []));

    fetch(`${API_BASE}/media`)
      .then(res => res.json())
      .then(data => setMediaList(data || []));

    if (isEditMode) {
      // Load post data
      fetch(`${API_BASE}/posts`)
        .then(res => res.json())
        .then(data => {
          const post = data.posts.find(p => p.id === parseInt(id));
          if (post) {
            setTitle(post.title);
            setSlug(post.slug);
            setExcerpt(post.excerpt);
            setContent(post.content);
            setStatus(post.status);
            setCategoryId(post.categoryId || '');
            setFeaturedImage(post.featuredImage || '');
            setTags(post.tags.map(t => t.name).join(', '));
          } else {
            setError('Post not found.');
          }
        })
        .catch(err => {
          console.error(err);
          setError('Failed to load post.');
        });
    }
  }, [id, isEditMode]);

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name: newCatName.trim() })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to create category');
        return res.json();
      })
      .then(newCat => {
        setCategories(prev => [...prev, newCat]);
        setCategoryId(newCat.id);
        setNewCatName('');
        setShowCatForm(false);
      })
      .catch(err => alert(err.message));
  };

  const handleEditorHelper = (tag) => {
    const textarea = document.getElementById('post-textarea');
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
    
    // Focus back and reset cursor
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
      excerpt,
      content,
      status,
      featuredImage: featuredImage || null,
      categoryId: categoryId ? parseInt(categoryId) : null,
      tags: tags
    };

    const url = isEditMode ? `${API_BASE}/posts/${id}` : `${API_BASE}/posts`;
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
        if (!res.ok) throw new Error(data.error || 'Failed to save post');
        return data;
      })
      .then(() => {
        setSaving(false);
        navigate('/admin/posts');
      })
      .catch(err => {
        console.error(err);
        setError(err.message || 'Error occurred while saving.');
        setSaving(false);
      });
  };

  return (
    <div style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      <div className="flex-between" style={{ marginBottom: '24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/admin/posts" className="btn btn-secondary" style={{ padding: '8px' }}>
            <ChevronLeft size={18} />
          </Link>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>
            {isEditMode ? 'Edit Post' : 'Add New Post'}
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={handleSave} 
            className="btn btn-primary"
            disabled={saving}
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save Post'}</span>
          </button>
        </div>
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
            placeholder="Add Title" 
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
                id="post-textarea"
                placeholder="Start writing article content..."
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
        <aside className="editor-sidebar">
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
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>URL Slug</h3>
            <input 
              type="text" 
              placeholder="e.g. custom-slug"
              value={slug}
              onChange={e => setSlug(e.target.value)}
              className="form-control"
            />
          </div>

          {/* Excerpt */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Post Excerpt</h3>
            <textarea 
              rows={3}
              placeholder="Brief summary of article..."
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              className="form-control"
              style={{ resize: 'none' }}
            />
          </div>

          {/* Categories */}
          <div style={{ marginBottom: '24px' }}>
            <div className="flex-between" style={{ marginBottom: '12px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</h3>
              <button 
                type="button" 
                onClick={() => setShowCatForm(!showCatForm)} 
                style={{ fontSize: '12px', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
              >
                <Plus size={12} /> Add New
              </button>
            </div>

            {showCatForm && (
              <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input 
                  type="text" 
                  placeholder="Category Name" 
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  className="form-control"
                  style={{ padding: '6px 10px', fontSize: '13px' }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '6px 10px' }}>
                  <Check size={14} />
                </button>
              </form>
            )}

            <select 
              value={categoryId} 
              onChange={e => setCategoryId(e.target.value)} 
              className="form-control"
            >
              <option value="">Uncategorized</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Tags</h3>
            <input 
              type="text" 
              placeholder="comma-separated tags..."
              value={tags}
              onChange={e => setTags(e.target.value)}
              className="form-control"
            />
          </div>

          {/* Featured Image */}
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Featured Image</h3>
            
            {featuredImage ? (
              <div style={{ position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '12px' }}>
                <img src={`http://localhost:5000${featuredImage}`} alt="Featured Preview" style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                <button 
                  type="button" 
                  onClick={() => setFeaturedImage('')} 
                  style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px', borderRadius: '50%', cursor: 'pointer' }}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button 
                type="button" 
                onClick={() => setShowMediaModal(true)}
                className="btn btn-secondary" 
                style={{ width: '100%', borderStyle: 'dashed', height: '100px', display: 'flex', flexDirection: 'column', gap: '8px' }}
              >
                <ImageIcon size={20} />
                <span style={{ fontSize: '12px' }}>Select Image</span>
              </button>
            )}
          </div>
        </aside>
      </div>

      {/* Media Selector Modal */}
      {showMediaModal && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          backgroundColor: 'rgba(0,0,0,0.7)', 
          zIndex: 1000, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div className="glass" style={{ 
            width: '100%', 
            maxWidth: '680px', 
            borderRadius: 'var(--radius-lg)', 
            border: '1px solid var(--border)',
            padding: '32px',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div className="flex-between" style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Choose Featured Image</h3>
              <button onClick={() => setShowMediaModal(false)} className="btn btn-secondary" style={{ padding: '6px' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ flexGrow: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', paddingBottom: '16px' }}>
              {mediaList.length === 0 ? (
                <div style={{ gridColumn: 'span 4', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No media assets uploaded. Go to the Media Library tab first to upload images.
                </div>
              ) : (
                mediaList.map(media => (
                  <div 
                    key={media.id} 
                    onClick={() => { setFeaturedImage(media.path); setShowMediaModal(false); }}
                    style={{ 
                      borderRadius: 'var(--radius-sm)', 
                      overflow: 'hidden', 
                      border: '1px solid var(--border)', 
                      aspectRatio: 1, 
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                  >
                    <img src={`http://localhost:5000${media.path}`} alt={media.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostEditorPage;
