import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiUser, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/catalogue', label: 'Catalogue' },
    { to: '/eresources', label: 'E-Resources' },
    { to: '/my-account', label: 'My Account' },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin Panel' }] : []),
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <div style={styles.logoIcon}>
            <span style={{ fontSize: 20 }}>📚</span>
          </div>
          <div>
            <div style={styles.logoTitle}>Lovely Professional University</div>
            <div style={styles.logoSub}>LIBRARY MANAGEMENT SYSTEM</div>
          </div>
        </Link>

        {/* Desktop links */}
        <div style={styles.links}>
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              style={{ ...styles.link, ...(isActive(link.to) ? styles.linkActive : {}) }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div style={styles.right}>
          {user && (
            <span style={styles.welcome}>
              ✅ Welcome! Reg No: {user.regNo}
            </span>
          )}
          <button onClick={handleLogout} className="btn btn-primary btn-sm" style={{ background: '#c0392b' }}>
            <FiLogOut size={14} /> Logout
          </button>
          <button style={styles.menuBtn} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              style={styles.mobileLink}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <button onClick={handleLogout} style={styles.mobileLogout}>Logout</button>
        </div>
      )}
    </nav>
  );
}

const styles = {
  nav: {
    background: 'white',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky', top: 0, zIndex: 100,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  inner: {
    maxWidth: 1200, margin: '0 auto',
    padding: '0 20px', height: 64,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  logo: { display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' },
  logoIcon: {
    width: 40, height: 40, background: '#8B1A1A',
    borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoTitle: { fontSize: 13, fontWeight: 700, color: '#8B1A1A', lineHeight: 1.2 },
  logoSub: { fontSize: 9, color: '#6b7280', letterSpacing: '0.05em' },
  links: { display: 'flex', gap: 4, alignItems: 'center' },
  link: {
    padding: '6px 14px', borderRadius: 6, fontSize: 14, fontWeight: 500,
    color: '#374151', transition: 'all 0.2s', textDecoration: 'none',
  },
  linkActive: { background: '#8B1A1A', color: 'white' },
  right: { display: 'flex', alignItems: 'center', gap: 12 },
  welcome: {
    fontSize: 12, background: '#dcfce7', color: '#16a34a',
    padding: '4px 10px', borderRadius: 20, fontWeight: 500,
  },
  menuBtn: {
    display: 'none', background: 'none', border: 'none',
    cursor: 'pointer', color: '#374151',
    '@media(max-width:768px)': { display: 'block' },
  },
  mobileMenu: {
    background: 'white', borderTop: '1px solid #e5e7eb',
    padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 4,
  },
  mobileLink: {
    padding: '10px 14px', borderRadius: 6, fontSize: 14,
    color: '#374151', fontWeight: 500,
  },
  mobileLogout: {
    padding: '10px 14px', borderRadius: 6, fontSize: 14,
    color: '#dc2626', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
  },
};
