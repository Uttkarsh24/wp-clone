import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ChevronLeft, HelpCircle } from 'lucide-react';
import { useAuth, API_BASE } from '../../App';

function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !password) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Login failed');
        }
        return data;
      })
      .then(data => {
        login(data.token, data.user);
        navigate('/admin/dashboard');
      })
      .catch(err => {
        console.error(err);
        setError(err.message || 'Invalid username or password.');
        setLoading(false);
      });
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'radial-gradient(circle at top, #1e293b 0%, #0f172a 100%)',
      padding: '24px'
    }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '32px', fontSize: '15px' }}>
        <ChevronLeft size={16} /> Back to website
      </Link>

      <div className="glass" style={{ 
        width: '100%', 
        maxWidth: '420px', 
        borderRadius: 'var(--radius-lg)', 
        border: '1px solid var(--border)',
        padding: '40px',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '56px', 
            height: '56px', 
            borderRadius: '50%', 
            backgroundColor: 'var(--primary-light)', 
            color: 'var(--primary)',
            marginBottom: '16px'
          }}>
            <ShieldCheck size={28} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Admin Login</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Access your WordPress Clone dashboard</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && (
            <div style={{ 
              padding: '12px 16px', 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              color: 'var(--danger)', 
              border: '1px solid rgba(239, 68, 68, 0.2)', 
              borderRadius: 'var(--radius-sm)',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              className="form-control" 
              placeholder="e.g. admin"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="form-control" 
              placeholder="e.g. admin123"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '12px', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ 
          marginTop: '24px', 
          borderTop: '1px solid var(--border)', 
          paddingTop: '20px', 
          fontSize: '13px', 
          color: 'var(--text-dark)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px',
          justifyContent: 'center'
        }}>
          <HelpCircle size={14} />
          <span>Demo Credentials: <strong>admin</strong> / <strong>admin123</strong></span>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
