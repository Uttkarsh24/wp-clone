import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useAuth, useSettings, API_BASE } from '../../App';

function SettingsPanel() {
  const { token } = useAuth();
  const { settings, updateSettingsState, fetchSettings } = useSettings();

  // Basic Form States
  const [siteTitle, setSiteTitle] = useState('');
  const [siteTagline, setSiteTagline] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');

  // Navigation Links State
  const [navMenu, setNavMenu] = useState([]);
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkPath, setNewLinkPath] = useState('/');

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (settings) {
      setSiteTitle(settings.site_title || '');
      setSiteTagline(settings.site_tagline || '');
      setPrimaryColor(settings.primary_color || '#6366f1');
      try {
        setNavMenu(JSON.parse(settings.navigation_menu || '[]'));
      } catch (e) {
        setNavMenu([]);
      }
    }
  }, [settings]);

  const handleAddNavLink = () => {
    if (!newLinkLabel.trim() || !newLinkPath.trim()) return;
    const updated = [...navMenu, { label: newLinkLabel.trim(), link: newLinkPath.trim() }];
    setNavMenu(updated);
    setNewLinkLabel('');
    setNewLinkPath('/');
  };

  const handleRemoveNavLink = (index) => {
    const updated = navMenu.filter((_, idx) => idx !== index);
    setNavMenu(updated);
  };

  const handleMoveNavLink = (index, direction) => {
    const updated = [...navMenu];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= updated.length) return;

    // Swap elements
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setNavMenu(updated);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError('');

    const payload = {
      site_title: siteTitle,
      site_tagline: siteTagline,
      primary_color: primaryColor,
      navigation_menu: JSON.stringify(navMenu)
    };

    fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update settings');
        return data;
      })
      .then(() => {
        setSaving(false);
        setSuccess(true);
        updateSettingsState(payload); // Update application contexts
        fetchSettings(); // Refresh settings configuration
        setTimeout(() => setSuccess(false), 3000);
      })
      .catch(err => {
        console.error(err);
        setError(err.message || 'Failed to save settings.');
        setSaving(false);
      });
  };

  return (
    <div style={{ maxWidth: '720px' }}>
      <div className="flex-between" style={{ marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800 }}>General Settings</h1>
          <p style={{ color: 'var(--text-muted)' }}>Customize your site metadata, primary accent branding, and menus.</p>
        </div>
      </div>

      {success && (
        <div style={{ 
          padding: '12px 16px', 
          backgroundColor: 'rgba(16, 185, 129, 0.1)', 
          color: 'var(--success)', 
          border: '1px solid rgba(16, 185, 129, 0.2)', 
          borderRadius: 'var(--radius-sm)',
          fontSize: '14px',
          marginBottom: '24px'
        }}>
          Settings saved and applied successfully!
        </div>
      )}

      {error && (
        <div style={{ 
          padding: '12px 16px', 
          backgroundColor: 'rgba(239, 68, 68, 0.1)', 
          color: 'var(--danger)', 
          border: '1px solid rgba(239, 68, 68, 0.2)', 
          borderRadius: 'var(--radius-sm)',
          fontSize: '14px',
          marginBottom: '24px'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Site Metadata Card */}
        <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Site Identity</h3>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Site Title</label>
            <input 
              type="text" 
              value={siteTitle} 
              onChange={e => setSiteTitle(e.target.value)} 
              className="form-control"
              placeholder="e.g. My Awesome Site"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Tagline</label>
            <input 
              type="text" 
              value={siteTagline} 
              onChange={e => setSiteTagline(e.target.value)} 
              className="form-control"
              placeholder="e.g. Just another React blog"
            />
          </div>
        </div>

        {/* Site Style Customization Card */}
        <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Design System Themes</h3>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Primary Brand Color</label>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <input 
                type="color" 
                value={primaryColor} 
                onChange={e => setPrimaryColor(e.target.value)} 
                style={{ 
                  width: '56px', 
                  height: '40px', 
                  borderRadius: 'var(--radius-sm)', 
                  border: '1px solid var(--border)', 
                  cursor: 'pointer',
                  backgroundColor: 'transparent'
                }}
              />
              <input 
                type="text" 
                value={primaryColor} 
                onChange={e => setPrimaryColor(e.target.value)} 
                className="form-control"
                placeholder="#6366f1"
                style={{ maxWidth: '140px' }}
              />
            </div>
          </div>
        </div>

        {/* Navigation Menus Card */}
        <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Navigation Links</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {navMenu.map((item, idx) => (
              <div key={idx} className="flex-between" style={{ padding: '12px 16px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <div>
                  <strong style={{ fontSize: '14px' }}>{item.label}</strong>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '12px' }}>{item.link}</span>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    type="button" 
                    onClick={() => handleMoveNavLink(idx, -1)} 
                    disabled={idx === 0} 
                    className="btn btn-secondary" 
                    style={{ padding: '4px', opacity: idx === 0 ? 0.3 : 1 }}
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleMoveNavLink(idx, 1)} 
                    disabled={idx === navMenu.length - 1} 
                    className="btn btn-secondary" 
                    style={{ padding: '4px', opacity: idx === navMenu.length - 1 ? 0.3 : 1 }}
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveNavLink(idx)} 
                    className="btn btn-danger" 
                    style={{ padding: '4px' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Link Text</label>
              <input 
                type="text" 
                placeholder="e.g. Contact" 
                value={newLinkLabel} 
                onChange={e => setNewLinkLabel(e.target.value)} 
                className="form-control" 
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">URL Path</label>
              <input 
                type="text" 
                placeholder="e.g. /contact" 
                value={newLinkPath} 
                onChange={e => setNewLinkPath(e.target.value)} 
                className="form-control" 
              />
            </div>
            <button type="button" onClick={handleAddNavLink} className="btn btn-secondary" style={{ padding: '12px 16px' }}>
              <Plus size={16} />
              <span>Add Link</span>
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ padding: '14px 28px', alignSelf: 'flex-start' }}
          disabled={saving}
        >
          <Save size={18} />
          <span>{saving ? 'Saving changes...' : 'Save Settings'}</span>
        </button>
      </form>
    </div>
  );
}

export default SettingsPanel;
