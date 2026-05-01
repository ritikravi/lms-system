import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiBook, FiClock, FiDollarSign, FiLock } from 'react-icons/fi';

const tabs = [
  { id: 'profile', label: 'Profile', icon: FiUser },
  { id: 'issued', label: 'Issued Books', icon: FiBook },
  { id: 'history', label: 'Reading History', icon: FiClock },
  { id: 'fines', label: 'Fines', icon: FiDollarSign },
  { id: 'password', label: 'Change Password', icon: FiLock },
];

const statusBadge = (status) => {
  const map = { issued: 'badge-info', returned: 'badge-success', overdue: 'badge-danger' };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
};

export default function MyAccount() {
  const { user, updateUser } = useAuth();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '', department: user?.department || '' });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });

  const { data: issuesData } = useQuery({
    queryKey: ['myIssues'],
    queryFn: () => api.get('/issues/my').then(r => r.data.data),
    enabled: activeTab === 'issued' || activeTab === 'history',
  });

  const { data: finesData } = useQuery({
    queryKey: ['myFines'],
    queryFn: () => api.get('/fines/my').then(r => r.data),
    enabled: activeTab === 'fines',
  });

  const updateProfile = useMutation({
    mutationFn: (data) => api.put('/users/profile/update', data),
    onSuccess: (res) => {
      updateUser(res.data.data);
      toast.success('Profile updated');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const changePassword = useMutation({
    mutationFn: (data) => api.put('/users/change-password', data),
    onSuccess: () => { toast.success('Password changed'); setPassForm({ currentPassword: '', newPassword: '', confirm: '' }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const renewBook = useMutation({
    mutationFn: (id) => api.put(`/issues/${id}/renew`),
    onSuccess: () => { toast.success('Book renewed'); qc.invalidateQueries(['myIssues']); },
    onError: (err) => toast.error(err.response?.data?.message || 'Renewal failed'),
  });

  const activeIssues = issuesData?.filter(i => i.status !== 'returned') || [];
  const history = issuesData?.filter(i => i.status === 'returned') || [];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>👤 My Account</h1>
        <p style={styles.sub}>Manage your library account and activity</p>
      </div>

      <div style={styles.layout}>
        {/* Sidebar tabs */}
        <div style={styles.sidebar}>
          <div style={styles.userCard}>
            <div style={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
            <div style={styles.userName}>{user?.name}</div>
            <div style={styles.userReg}>{user?.regNo}</div>
            <span className="badge badge-success" style={{ marginTop: 6 }}>{user?.membershipType}</span>
          </div>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              style={{ ...styles.tabBtn, ...(activeTab === id ? styles.tabBtnActive : {}) }}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={styles.content}>
          {/* Profile */}
          {activeTab === 'profile' && (
            <div className="card">
              <h2 style={styles.cardTitle}>Profile Information</h2>
              <div style={styles.formGrid}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input className="form-control" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Registration No</label>
                  <input className="form-control" value={user?.regNo} disabled style={{ background: '#f9fafb' }} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input className="form-control" value={user?.email} disabled style={{ background: '#f9fafb' }} />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input className="form-control" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input className="form-control" value={profileForm.department} onChange={e => setProfileForm({ ...profileForm, department: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Membership Expiry</label>
                  <input className="form-control" value={user?.membershipExpiry ? new Date(user.membershipExpiry).toLocaleDateString() : ''} disabled style={{ background: '#f9fafb' }} />
                </div>
              </div>
              <button className="btn btn-primary" onClick={() => updateProfile.mutate(profileForm)} disabled={updateProfile.isPending}>
                {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          {/* Issued Books */}
          {activeTab === 'issued' && (
            <div className="card" style={{ padding: 0 }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
                <h2 style={styles.cardTitle}>Currently Issued Books ({activeIssues.length})</h2>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>BOOK</th><th>ISSUE DATE</th><th>DUE DATE</th><th>STATUS</th><th>FINE</th><th>ACTION</th></tr>
                  </thead>
                  <tbody>
                    {activeIssues.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>No books currently issued</td></tr>
                    ) : activeIssues.map(issue => (
                      <tr key={issue._id}>
                        <td>
                          <div style={{ fontWeight: 500 }}>{issue.book?.title}</div>
                          <div style={{ fontSize: 12, color: '#9ca3af' }}>{issue.book?.author}</div>
                        </td>
                        <td>{new Date(issue.issueDate).toLocaleDateString()}</td>
                        <td style={{ color: new Date(issue.dueDate) < new Date() ? '#dc2626' : 'inherit' }}>
                          {new Date(issue.dueDate).toLocaleDateString()}
                        </td>
                        <td>{statusBadge(issue.status)}</td>
                        <td>{issue.currentFine > 0 ? <span style={{ color: '#dc2626', fontWeight: 600 }}>₹{issue.currentFine}</span> : '—'}</td>
                        <td>
                          <button className="btn btn-outline btn-sm" onClick={() => renewBook.mutate(issue._id)} disabled={issue.renewCount >= 2}>
                            Renew ({2 - (issue.renewCount || 0)} left)
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reading History */}
          {activeTab === 'history' && (
            <div className="card" style={{ padding: 0 }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
                <h2 style={styles.cardTitle}>Reading History ({history.length})</h2>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>BOOK</th><th>ISSUE DATE</th><th>RETURN DATE</th><th>FINE PAID</th></tr>
                  </thead>
                  <tbody>
                    {history.length === 0 ? (
                      <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>No reading history</td></tr>
                    ) : history.map(issue => (
                      <tr key={issue._id}>
                        <td>
                          <div style={{ fontWeight: 500 }}>{issue.book?.title}</div>
                          <div style={{ fontSize: 12, color: '#9ca3af' }}>{issue.book?.author}</div>
                        </td>
                        <td>{new Date(issue.issueDate).toLocaleDateString()}</td>
                        <td>{issue.returnDate ? new Date(issue.returnDate).toLocaleDateString() : '—'}</td>
                        <td>{issue.fineAmount > 0 ? (issue.finePaid ? <span className="badge badge-success">Paid ₹{issue.fineAmount}</span> : <span className="badge badge-danger">Pending ₹{issue.fineAmount}</span>) : <span className="badge badge-success">No Fine</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Fines */}
          {activeTab === 'fines' && (
            <div>
              {finesData?.totalUnpaid > 0 && (
                <div style={styles.fineAlert}>
                  ⚠️ You have pending fines of <strong>₹{finesData.totalUnpaid}</strong>. Please visit the library counter to pay.
                </div>
              )}
              <div className="card" style={{ padding: 0 }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
                  <h2 style={styles.cardTitle}>Fine Details</h2>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>BOOK</th><th>DUE DATE</th><th>RETURN DATE</th><th>FINE</th><th>STATUS</th></tr>
                    </thead>
                    <tbody>
                      {(finesData?.data || []).length === 0 ? (
                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>No fines</td></tr>
                      ) : (finesData?.data || []).map(f => (
                        <tr key={f.issueId}>
                          <td style={{ fontWeight: 500 }}>{f.book?.title}</td>
                          <td>{new Date(f.dueDate).toLocaleDateString()}</td>
                          <td>{f.returnDate ? new Date(f.returnDate).toLocaleDateString() : 'Not returned'}</td>
                          <td style={{ fontWeight: 600, color: '#dc2626' }}>₹{f.fineAmount}</td>
                          <td>{f.finePaid ? <span className="badge badge-success">Paid</span> : <span className="badge badge-danger">Pending</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Change Password */}
          {activeTab === 'password' && (
            <div className="card" style={{ maxWidth: 420 }}>
              <h2 style={styles.cardTitle}>Change Password</h2>
              <div className="form-group">
                <label>Current Password</label>
                <input type="password" className="form-control" value={passForm.currentPassword} onChange={e => setPassForm({ ...passForm, currentPassword: e.target.value })} />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" className="form-control" value={passForm.newPassword} onChange={e => setPassForm({ ...passForm, newPassword: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input type="password" className="form-control" value={passForm.confirm} onChange={e => setPassForm({ ...passForm, confirm: e.target.value })} />
              </div>
              <button className="btn btn-primary" disabled={changePassword.isPending}
                onClick={() => {
                  if (passForm.newPassword !== passForm.confirm) return toast.error('Passwords do not match');
                  changePassword.mutate({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
                }}>
                {changePassword.isPending ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: 1200, margin: '0 auto', padding: '28px 20px' },
  header: { marginBottom: 24 },
  title: { fontSize: 26, fontWeight: 700 },
  sub: { color: '#6b7280', marginTop: 4 },
  layout: { display: 'flex', gap: 20, alignItems: 'flex-start' },
  sidebar: { width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 4 },
  userCard: {
    background: 'white', borderRadius: 10, padding: '20px 16px',
    textAlign: 'center', marginBottom: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  avatar: {
    width: 56, height: 56, background: '#8B1A1A', color: 'white',
    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 22, fontWeight: 700, margin: '0 auto 10px',
  },
  userName: { fontWeight: 600, fontSize: 15 },
  userReg: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  tabBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 14px', borderRadius: 8, border: 'none',
    background: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 500,
    color: '#374151', width: '100%', textAlign: 'left',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  tabBtnActive: { background: '#8B1A1A', color: 'white' },
  content: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: 600, marginBottom: 20 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 },
  fineAlert: {
    background: '#fef3c7', border: '1px solid #fcd34d',
    borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 14,
  },
};
