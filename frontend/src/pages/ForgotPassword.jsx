import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset email sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Forgot Password</h2>
        {sent ? (
          <div style={styles.success}>
            ✅ Password reset link sent to <strong>{email}</strong>. Check your inbox.
            <br /><br />
            <Link to="/login" style={{ color: '#8B1A1A' }}>← Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p style={styles.desc}>Enter your registered email address and we'll send you a reset link.</p>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" className="form-control" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Link to="/login" style={{ fontSize: 13, color: '#6b7280' }}>← Back to Login</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#fdf6f0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { background: 'white', borderRadius: 12, padding: '36px 32px', width: '100%', maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 8 },
  desc: { fontSize: 14, color: '#6b7280', marginBottom: 20 },
  success: { fontSize: 14, color: '#374151', lineHeight: 1.7 },
};
