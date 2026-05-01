import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiBook } from 'react-icons/fi';

const departments = [
  'CSE', 'CSE / IT', 'CSE / AI', 'CSE / ECE', 'CSE / MCA',
  'ECE', 'ME', 'CE', 'EE', 'MBA', 'MCA', 'BCA', 'B.Com', 'Other'
];

const courses = [
  'B.Tech', 'M.Tech', 'MCA', 'MBA', 'BCA', 'B.Com', 'M.Com', 'PhD', 'Other'
];

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    regNo: '', name: '', email: '', password: '', confirmPassword: '',
    department: '', course: '', phone: '', role: 'student',
  });

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const validateStep1 = () => {
    if (!form.regNo.trim()) return toast.error('Registration number is required');
    if (!form.name.trim()) return toast.error('Full name is required');
    if (!form.email.trim() || !form.email.includes('@')) return toast.error('Valid email is required');
    return true;
  };

  const validateStep2 = () => {
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (!form.department) return toast.error('Please select your department');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        regNo: form.regNo.toUpperCase(),
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        department: form.department,
        course: form.course,
        phone: form.phone,
      });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success(`Welcome, ${data.user.name}! Account created.`);
      navigate(data.user.role === 'student' ? '/' : '/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
          <div style={styles.logoText}>LPU Library</div>
          <div style={styles.logoSub}>CREATE YOUR ACCOUNT</div>
        </div>

        {/* Step indicator */}
        <div style={styles.steps}>
          {[1, 2].map(s => (
            <div key={s} style={styles.stepWrap}>
              <div style={{ ...styles.stepDot, ...(step >= s ? styles.stepDotActive : {}) }}>{s}</div>
              <div style={{ ...styles.stepLabel, ...(step >= s ? styles.stepLabelActive : {}) }}>
                {s === 1 ? 'Basic Info' : 'Details'}
              </div>
            </div>
          ))}
          <div style={styles.stepLine} />
        </div>

        <form onSubmit={step === 1 ? (e) => { e.preventDefault(); if (validateStep1()) setStep(2); } : handleSubmit}>

          {/* Step 1 */}
          {step === 1 && (
            <>
              <div className="form-group">
                <label>Registration / Enrollment Number *</label>
                <input
                  className="form-control"
                  placeholder="e.g. 12528517"
                  value={form.regNo}
                  onChange={e => set('regNo', e.target.value)}
                  required
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  className="form-control"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="your@lpu.in"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Account Type</label>
                <select className="form-control" value={form.role} onChange={e => set('role', e.target.value)}>
                  <option value="student">Student</option>
                  <option value="librarian">Librarian</option>
                </select>
              </div>
              <button type="submit" style={styles.btn}>
                Continue →
              </button>
            </>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label>Department *</label>
                  <select className="form-control" value={form.department} onChange={e => set('department', e.target.value)} required>
                    <option value="">Select dept.</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Course</label>
                  <select className="form-control" value={form.course} onChange={e => set('course', e.target.value)}>
                    <option value="">Select course</option>
                    {courses.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  className="form-control"
                  placeholder="+91 XXXXXXXXXX"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    required
                    style={{ paddingRight: 40 }}
                  />
                  <button type="button" style={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
                    {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
                {/* Password strength */}
                {form.password && (
                  <div style={styles.strengthBar}>
                    <div style={{
                      ...styles.strengthFill,
                      width: form.password.length >= 10 ? '100%' : form.password.length >= 6 ? '60%' : '30%',
                      background: form.password.length >= 10 ? '#16a34a' : form.password.length >= 6 ? '#d97706' : '#dc2626',
                    }} />
                    <span style={styles.strengthText}>
                      {form.password.length >= 10 ? 'Strong' : form.password.length >= 6 ? 'Medium' : 'Weak'}
                    </span>
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Confirm Password *</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={e => set('confirmPassword', e.target.value)}
                  required
                />
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <div style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>Passwords do not match</div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" style={styles.backBtn} onClick={() => setStep(1)}>← Back</button>
                <button type="submit" style={{ ...styles.btn, flex: 1 }} disabled={loading}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </>
          )}
        </form>

        <div style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#8B1A1A', fontWeight: 600 }}>Log in</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh', background: '#fdf6f0',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
  },
  card: {
    background: 'white', borderRadius: 14,
    padding: '36px 32px', width: '100%', maxWidth: 460,
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  },
  logoWrap: { textAlign: 'center', marginBottom: 24 },
  logoCircle: {
    width: 52, height: 52, background: '#8B1A1A',
    borderRadius: '50%', display: 'flex', alignItems: 'center',
    justifyContent: 'center', margin: '0 auto 8px', fontSize: 22,
  },
  logoText: { fontSize: 20, fontWeight: 700, color: '#1a1a1a' },
  logoSub: { fontSize: 10, color: '#9ca3af', letterSpacing: '0.1em', marginTop: 2 },
  steps: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 40, marginBottom: 28, position: 'relative',
  },
  stepLine: {
    position: 'absolute', top: 14, left: '25%', right: '25%',
    height: 2, background: '#e5e7eb', zIndex: 0,
  },
  stepWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, zIndex: 1 },
  stepDot: {
    width: 28, height: 28, borderRadius: '50%',
    background: '#e5e7eb', color: '#9ca3af',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 600,
  },
  stepDotActive: { background: '#8B1A1A', color: 'white' },
  stepLabel: { fontSize: 11, color: '#9ca3af' },
  stepLabelActive: { color: '#8B1A1A', fontWeight: 600 },
  btn: {
    width: '100%', padding: '13px', background: '#8B1A1A',
    color: 'white', border: 'none', borderRadius: 8,
    fontSize: 15, fontWeight: 600, cursor: 'pointer',
    transition: 'background 0.2s', marginTop: 4,
  },
  backBtn: {
    padding: '13px 20px', background: '#f3f4f6',
    color: '#374151', border: 'none', borderRadius: 8,
    fontSize: 15, fontWeight: 500, cursor: 'pointer',
  },
  eyeBtn: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af',
    display: 'flex', alignItems: 'center',
  },
  strengthBar: { marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 },
  strengthFill: { height: 4, borderRadius: 4, transition: 'all 0.3s', flex: 1 },
  strengthText: { fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap' },
  footer: { textAlign: 'center', marginTop: 20, fontSize: 14, color: '#6b7280' },
};
