import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Copy, FileIcon, X, Check } from 'lucide-react';
import { useAuth, API_BASE } from '../../App';

function MediaLibrary() {
  const { token } = useAuth();
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const fetchMedia = () => {
    setLoading(true);
    fetch(`${API_BASE}/media`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setMediaList(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMedia();
  }, [token]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    fetch(`${API_BASE}/media`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    })
      .then(res => {
        if (!res.ok) throw new Error('Upload failed');
        return res.json();
      })
      .then(newMedia => {
        setMediaList(prev => [newMedia, ...prev]);
        setUploading(false);
      })
      .catch(err => {
        console.error(err);
        alert('File upload failed. Ensure file size < 10MB.');
        setUploading(false);
      });
  };

  const handleDeleteMedia = (id) => {
    if (!window.confirm('Are you sure you want to delete this media file? This action is permanent.')) return;

    fetch(`${API_BASE}/media/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Delete failed');
        setMediaList(prev => prev.filter(m => m.id !== id));
        setSelectedMedia(null);
      })
      .catch(err => console.error(err));
  };

  const handleCopyUrl = (path, id) => {
    navigator.clipboard.writeText(path).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImage = (mimeType) => mimeType.startsWith('image/');

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Media Library</h1>
          <p style={{ color: 'var(--text-muted)' }}>Upload, manage, and retrieve assets for your articles.</p>
        </div>
        
        <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
          <Upload size={18} />
          <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
          <input 
            type="file" 
            onChange={handleFileUpload} 
            style={{ display: 'none' }} 
            disabled={uploading}
          />
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedMedia ? '1fr 340px' : '1fr', gap: '32px' }}>
        {/* Media Grid */}
        <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading media library...</div>
          ) : mediaList.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No media files uploaded yet. Select files using the upload button.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '20px' }}>
              {mediaList.map((media) => (
                <div 
                  key={media.id} 
                  onClick={() => setSelectedMedia(media)}
                  className="media-card"
                  style={{ border: selectedMedia?.id === media.id ? '2px solid var(--primary)' : '1px solid var(--border)' }}
                >
                  {isImage(media.mimeType) ? (
                    <img src={`http://localhost:5000${media.path}`} alt={media.filename} />
                  ) : (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-dark)' }}>
                      <FileIcon size={32} />
                      <span style={{ fontSize: '11px', textAlign: 'center', padding: '0 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>{media.filename}</span>
                    </div>
                  )}

                  <div className="media-overlay">
                    <span style={{ fontSize: '12px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'white' }}>
                      {media.filename}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Media Drawer details */}
        {selectedMedia && (
          <aside className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '20px', height: 'fit-content' }}>
            <div className="flex-between">
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Asset Details</h3>
              <button onClick={() => setSelectedMedia(null)} className="btn btn-secondary" style={{ padding: '4px' }}>
                <X size={14} />
              </button>
            </div>

            <div style={{ width: '100%', height: '160px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border)' }}>
              {isImage(selectedMedia.mimeType) ? (
                <img src={`http://localhost:5000${selectedMedia.path}`} alt={selectedMedia.filename} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dark)' }}>
                  <FileIcon size={48} />
                </div>
              )}
            </div>

            <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <span style={{ color: 'var(--text-dark)', display: 'block' }}>Filename</span>
                <strong style={{ overflowWrap: 'anywhere' }}>{selectedMedia.filename}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-dark)', display: 'block' }}>Mime Type</span>
                <strong>{selectedMedia.mimeType}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-dark)', display: 'block' }}>File Size</span>
                <strong>{formatBytes(selectedMedia.size)}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-dark)', display: 'block' }}>Uploaded on</span>
                <strong>{new Date(selectedMedia.createdAt).toLocaleDateString()}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <div>
                <span style={{ color: 'var(--text-dark)', display: 'block', fontSize: '13px', marginBottom: '6px' }}>Relative File Path</span>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    readOnly 
                    value={selectedMedia.path} 
                    className="form-control" 
                    style={{ fontSize: '12px', paddingRight: '40px', backgroundColor: 'var(--bg-surface-elevated)' }}
                  />
                  <button 
                    onClick={() => handleCopyUrl(selectedMedia.path, selectedMedia.id)}
                    className="btn btn-secondary" 
                    style={{ position: 'absolute', right: '4px', top: '4px', bottom: '4px', padding: '6px' }}
                    title="Copy URL"
                  >
                    {copiedId === selectedMedia.id ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <button 
                onClick={() => handleDeleteMedia(selectedMedia.id)}
                className="btn btn-danger" 
                style={{ width: '100%', marginTop: '10px' }}
              >
                <Trash2 size={16} />
                <span>Delete File</span>
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

export default MediaLibrary;
