import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ regNo: '', password: '', role: 'student' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.regNo || !form.password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      const user = await login(form.regNo, form.password, form.role);
      toast.success(`Welcome, ${user.name}!`);
      navigate(user.role === 'student' ? '/' : '/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <div style={styles.logoCircle}>📚</div>
          <div style={styles.logoText}>lms</div>
          <div style={styles.logoSub}>LIBRARY MANAGEMENT SYSTEM</div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Role selector */}
          <div style={styles.roleRow}>
            <span style={styles.loginLabel}>Log in</span>
            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
              style={styles.roleSelect}
            >
              <option value="student">Student</option>
              <option value="admin">HeadOffice / Admin</option>
              <option value="librarian">Librarian</option>
            </select>
          </div>

          {/* User ID */}
          <div style={styles.inputWrap}>
            <input
              type="text"
              placeholder="User ID / Reg No"
              value={form.regNo}
              onChange={e => setForm({ ...form, regNo: e.target.value })}
              style={styles.input}
              autoComplete="username"
            />
            <FiUser style={styles.inputIcon} />
          </div>

          {/* Password */}
          <div style={styles.inputWrap}>
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              style={styles.input}
              autoComplete="current-password"
            />
            <button type="button" style={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
              {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>

          <div style={{ textAlign: 'right', marginBottom: 20 }}>
            <Link to="/forgot-password" style={styles.forgotLink}>Forgot your password?</Link>
          </div>

          <button type="submit" disabled={loading} style={styles.loginBtn}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={styles.studentMail}>
          ✉️ <a href="mailto:student@lpu.in" style={{ color: '#6b7280' }}>Student Mail</a>
        </div>
        <div style={{ textAlign: 'center', marginTop: 14, fontSize: 13, color: '#6b7280' }}>
          New student?{' '}
          <Link to="/register" style={{ color: '#8B1A1A', fontWeight: 600 }}>Create an account</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh', background: '#fdf6f0',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 20,
  },
  card: {
    background: 'white', borderRadius: 12,
    padding: '36px 32px', width: '100%', maxWidth: 400,
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  },
  logoWrap: { textAlign: 'center', marginBottom: 28 },
  logoCircle: {
    width: 56, height: 56, background: '#1a1a1a',
    borderRadius: '50%', display: 'flex', alignItems: 'center',
    justifyContent: 'center', margin: '0 auto 8px', fontSize: 24,
  },
  logoText: { fontSize: 28, fontWeight: 700, letterSpacing: 2, color: '#1a1a1a' },
  logoSub: { fontSize: 10, color: '#9ca3af', letterSpacing: '0.1em', marginTop: 2 },
  roleRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  loginLabel: { fontSize: 20, fontWeight: 600 },
  roleSelect: {
    border: '1px solid #e5e7eb', borderRadius: 8,
    padding: '6px 12px', fontSize: 14, cursor: 'pointer', outline: 'none',
  },
  inputWrap: { position: 'relative', marginBottom: 14 },
  input: {
    width: '100%', padding: '12px 40px 12px 14px',
    border: '1px solid #e5e7eb', borderRadius: 8,
    fontSize: 14, outline: 'none', fontFamily: 'inherit',
    transition: 'border-color 0.2s',
  },
  inputIcon: { position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' },
  eyeBtn: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af',
    display: 'flex', alignItems: 'center',
  },
  forgotLink: { fontSize: 13, color: '#6b7280', textDecoration: 'none' },
  loginBtn: {
    width: '100%', padding: '13px', background: '#e67e22',
    color: 'white', border: 'none', borderRadius: 8,
    fontSize: 16, fontWeight: 600, cursor: 'pointer',
    transition: 'background 0.2s',
  },
  studentMail: { textAlign: 'center', marginTop: 24, fontSize: 13, color: '#6b7280' },
};
