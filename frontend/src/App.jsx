import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  FileText, LayoutDashboard, Image, MessageSquare, Settings as SettingsIcon, 
  Plus, LogOut, Globe, Edit2, Trash2, Check, X, ShieldAlert,
  Moon, Sun, Menu, ChevronRight, Folder, Tag as TagIcon, Calendar, User as UserIcon
} from 'lucide-react';

// Create API Base URL
export const API_BASE = 'http://localhost:5000/api';

// --- CONTEXTS ---
const AuthContext = createContext(null);
const SettingsContext = createContext(null);

export const useAuth = () => useContext(AuthContext);
export const useSettings = () => useContext(SettingsContext);

// Hex to RGB converter helper for dynamic custom properties
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '99, 102, 241';
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('wp_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem('wp_token', token);
      fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error('Token invalid');
          return res.json();
        })
        .then(data => {
          setUser(data.user);
          setLoading(false);
        })
        .catch(() => {
          logout();
          setLoading(false);
        });
    } else {
      localStorage.removeItem('wp_token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const login = (jwtToken, userData) => {
    setToken(jwtToken);
    setUser(userData);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('wp_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    site_title: 'React WordPress CMS',
    site_tagline: 'A modern lightweight CMS powered by React & Node.js',
    primary_color: '#6366f1',
    accent_color: '#4f46e5',
    navigation_menu: '[]'
  });
  const [theme, setTheme] = useState(localStorage.getItem('wp_theme') || 'dark');

  const fetchSettings = () => {
    fetch(`${API_BASE}/settings`)
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        if (data.primary_color) {
          document.documentElement.style.setProperty('--primary', data.primary_color);
          document.documentElement.style.setProperty('--primary-rgb', hexToRgb(data.primary_color));
        }
      })
      .catch(err => console.error('Failed to load settings:', err));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('wp_theme', theme);
  }, [theme]);

  const updateSettingsState = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    if (newSettings.primary_color) {
      document.documentElement.style.setProperty('--primary', newSettings.primary_color);
      document.documentElement.style.setProperty('--primary-rgb', hexToRgb(newSettings.primary_color));
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettingsState, fetchSettings, theme, toggleTheme }}>
      {children}
    </SettingsContext.Provider>
  );
};

// --- ROUTE GUARD ---
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading profile...</div>;
  if (!user) return <Routes><Route path="*" element={<AdminLogin />} /></Routes>; // Render login inline or redirect

  return children;
};

// --- DUMMY IMPORTS FOR ROUTING ---
// These will be fully written below in pages/components
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import PageDetail from './pages/PageDetail';

import AdminLogin from './pages/admin/AdminLogin';
import DashboardOverview from './pages/admin/DashboardOverview';
import PostsManager from './pages/admin/PostsManager';
import PostEditorPage from './pages/admin/PostEditorPage';
import PagesManager from './pages/admin/PagesManager';
import PageEditorPage from './pages/admin/PageEditorPage';
import MediaLibrary from './pages/admin/MediaLibrary';
import CommentsModerator from './pages/admin/CommentsModerator';
import SettingsPanel from './pages/admin/SettingsPanel';

// --- VISITOR HEADER & FOOTER LAYOUT ---
const PublicLayout = ({ children }) => {
  const { settings, theme, toggleTheme } = useSettings();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  let navMenu = [];
  try {
    navMenu = JSON.parse(settings.navigation_menu || '[]');
  } catch (e) {}

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header className="glass" style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--border)' }}>
        <div className="container flex-between" style={{ height: '80px' }}>
          <div>
            <Link to="/" style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px' }}>{settings.site_title}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{settings.site_tagline}</span>
            </Link>
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div className={`nav-links ${menuOpen ? 'open' : ''}`} style={{ display: 'flex', gap: '24px' }}>
              {navMenu.map((item, idx) => (
                <Link key={idx} to={item.link} style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-muted)' }} onClick={() => setMenuOpen(false)}>
                  {item.label}
                </Link>
              ))}
            </div>
            
            <button onClick={toggleTheme} className="btn btn-secondary" style={{ padding: '8px', borderRadius: '50%' }}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <Link to="/admin/dashboard" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>
                Dashboard
              </Link>
            ) : (
              <Link to="/admin/login" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }}>
                Admin
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main style={{ flexGrow: 1, padding: '48px 0' }}>
        {children}
      </main>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '40px 0', backgroundColor: 'var(--bg-surface)' }}>
        <div className="container flex-between" style={{ color: 'var(--text-dark)', fontSize: '14px' }}>
          <div>
            &copy; {new Date().getFullYear()} {settings.site_title}. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/admin/login">Admin Console</Link>
            <span>&middot;</span>
            <Link to="/about">About Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- ADMIN SIDEBAR LAYOUT ---
const AdminLayout = ({ children }) => {
  const { settings, theme, toggleTheme } = useSettings();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Posts', path: '/admin/posts', icon: <Edit2 size={20} /> },
    { label: 'Pages', path: '/admin/pages', icon: <FileText size={20} /> },
    { label: 'Media Library', path: '/admin/media', icon: <Image size={20} /> },
    { label: 'Comments', path: '/admin/comments', icon: <MessageSquare size={20} /> },
    { label: 'Settings', path: '/admin/settings', icon: <SettingsIcon size={20} /> },
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px' }}>{settings.site_title}</span>
          <span style={{ fontSize: '11px', color: 'var(--text-dark)' }}>CMS Administrator</span>
        </div>
        
        <nav style={{ flexGrow: 1, paddingTop: '16px' }}>
          {menuItems.map((item, idx) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link key={idx} to={item.path} className={`admin-nav-item ${isActive ? 'active' : ''}`}>
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-dark)' }}>{user?.username}</span>
            <button onClick={toggleTheme} className="btn" style={{ padding: '4px', color: 'var(--text-muted)' }}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} className="btn btn-danger" style={{ width: '100%', padding: '10px' }}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
          <Link to="/" className="btn btn-secondary" style={{ width: '100%', padding: '10px' }}>
            <Globe size={16} />
            <span>View Site</span>
          </Link>
        </div>
      </aside>

      <main className="admin-main">
        {children}
      </main>
    </div>
  );
};

// --- APP COMPONENT ---
function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Visitor Routes */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/post/:slug" element={<PublicLayout><PostDetail /></PublicLayout>} />
            <Route path="/:slug" element={<PublicLayout><PageDetail /></PublicLayout>} />

            {/* Admin Login Route */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Admin Console Routes */}
            <Route path="/admin" element={<ProtectedRoute><AdminLayout><DashboardOverview /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/dashboard" element={<ProtectedRoute><AdminLayout><DashboardOverview /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/posts" element={<ProtectedRoute><AdminLayout><PostsManager /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/posts/new" element={<ProtectedRoute><AdminLayout><PostEditorPage /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/posts/edit/:id" element={<ProtectedRoute><AdminLayout><PostEditorPage /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/pages" element={<ProtectedRoute><AdminLayout><PagesManager /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/pages/new" element={<ProtectedRoute><AdminLayout><PageEditorPage /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/pages/edit/:id" element={<ProtectedRoute><AdminLayout><PageEditorPage /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/media" element={<ProtectedRoute><AdminLayout><MediaLibrary /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/comments" element={<ProtectedRoute><AdminLayout><CommentsModerator /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute><AdminLayout><SettingsPanel /></AdminLayout></ProtectedRoute>} />
          </Routes>
        </Router>
      </AuthProvider>
    </SettingsProvider>
  );
}

export default App;
