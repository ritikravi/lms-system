import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome, FiBook, FiUsers, FiRepeat,
  FiDollarSign, FiBell, FiLogOut, FiMenu, FiX
} from 'react-icons/fi';
import { useState } from 'react';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: FiHome },
  { to: '/admin/books', label: 'Books', icon: FiBook },
  { to: '/admin/users', label: 'Users', icon: FiUsers },
  { to: '/admin/issues', label: 'Issues', icon: FiRepeat },
  { to: '/admin/fines', label: 'Fines', icon: FiDollarSign },
  { to: '/admin/notices', label: 'Notices', icon: FiBell },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const isActive = (path) =>
    path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path);

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={{ ...styles.sidebar, width: collapsed ? 64 : 220 }}>
        <div style={styles.sidebarHeader}>
          {!collapsed && (
            <div>
              <div style={styles.sidebarTitle}>LMS Admin</div>
              <div style={styles.sidebarSub}>{user?.name}</div>
            </div>
          )}
          <button style={styles.collapseBtn} onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <FiMenu size={18} /> : <FiX size={18} />}
          </button>
        </div>

        <nav style={styles.sidebarNav}>
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              style={{
                ...styles.navItem,
                ...(isActive(to) ? styles.navItemActive : {}),
              }}
              title={collapsed ? label : ''}
            >
              <Icon size={18} />
              {!collapsed && <span>{label}</span>}
            </Link>
          ))}
        </nav>

        <div style={styles.sidebarFooter}>
          <Link to="/" style={{ ...styles.navItem, color: '#9ca3af' }} title="Student View">
            <FiHome size={18} />
            {!collapsed && <span>Student View</span>}
          </Link>
          <button style={{ ...styles.navItem, ...styles.logoutBtn }} onClick={handleLogout} title="Logout">
            <FiLogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={styles.main}>
        <div style={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: { display: 'flex', minHeight: '100vh', background: '#f3f4f6' },
  sidebar: {
    background: '#8B1A1A', color: 'white',
    display: 'flex', flexDirection: 'column',
    position: 'sticky', top: 0, height: '100vh',
    transition: 'width 0.2s', overflow: 'hidden', flexShrink: 0,
  },
  sidebarHeader: {
    padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  sidebarTitle: { fontSize: 16, fontWeight: 700 },
  sidebarSub: { fontSize: 12, opacity: 0.7, marginTop: 2 },
  collapseBtn: {
    background: 'rgba(255,255,255,0.1)', border: 'none',
    color: 'white', cursor: 'pointer', borderRadius: 6,
    padding: 6, display: 'flex', alignItems: 'center',
  },
  sidebarNav: { flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 12px', borderRadius: 8,
    color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 500,
    textDecoration: 'none', transition: 'all 0.15s',
    background: 'none', border: 'none', cursor: 'pointer', width: '100%',
  },
  navItemActive: { background: 'rgba(255,255,255,0.2)', color: 'white' },
  sidebarFooter: { padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.1)' },
  logoutBtn: { color: '#fca5a5' },
  main: { flex: 1, overflow: 'auto' },
  content: { padding: 28, maxWidth: 1200, margin: '0 auto' },
};
