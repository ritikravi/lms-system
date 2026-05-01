import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { FiBook, FiUsers, FiRepeat, FiAlertTriangle, FiDollarSign, FiTrendingUp } from 'react-icons/fi';

const statusBadge = (status) => {
  const map = { issued: 'badge-info', overdue: 'badge-danger', returned: 'badge-success' };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
};

export default function AdminDashboard() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => api.get('/dashboard/admin').then(r => r.data.data),
    refetchInterval: 60000,
  });

  const stats = data?.stats;
  const recentBooks = data?.recentBooks || [];
  const recentIssues = data?.recentIssues || [];

  const statCards = [
    { label: 'Total Books', value: stats?.totalBooks || 0, icon: FiBook, color: '#8B1A1A' },
    { label: 'Registered Users', value: stats?.totalUsers || 0, icon: FiUsers, color: '#2563eb' },
    { label: 'Active Issues', value: stats?.activeIssues || 0, icon: FiRepeat, color: '#16a34a' },
    { label: 'Overdue Books', value: stats?.overdueIssues || 0, icon: FiAlertTriangle, color: '#d97706' },
    { label: "Today's Issues", value: stats?.todayIssues || 0, icon: FiTrendingUp, color: '#7c3aed' },
    { label: 'Pending Fines', value: `₹${stats?.pendingFines || 0}`, icon: FiDollarSign, color: '#dc2626' },
  ];

  if (isLoading) return <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.name} — {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Stats grid */}
      <div style={styles.statsGrid}>
        {statCards.map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
              <div style={{ ...styles.statIcon, background: s.color + '15', color: s.color }}>
                <s.icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.grid2}>
        {/* Recent Issues */}
        <div className="card" style={{ padding: 0 }}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Recent Issues</h3>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>BOOK</th><th>STUDENT</th><th>DUE DATE</th><th>STATUS</th></tr>
              </thead>
              <tbody>
                {recentIssues.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: 24, color: '#9ca3af' }}>No recent issues</td></tr>
                ) : recentIssues.map(issue => (
                  <tr key={issue._id}>
                    <td style={{ fontWeight: 500, fontSize: 13 }}>{issue.book?.title}</td>
                    <td>
                      <div style={{ fontSize: 13 }}>{issue.user?.name}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{issue.user?.regNo}</div>
                    </td>
                    <td style={{ fontSize: 13, color: new Date(issue.dueDate) < new Date() ? '#dc2626' : 'inherit' }}>
                      {new Date(issue.dueDate).toLocaleDateString()}
                    </td>
                    <td>{statusBadge(issue.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recently Added Books */}
        <div className="card" style={{ padding: 0 }}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Recently Added Books</h3>
          </div>
          <div style={{ padding: '8px 0' }}>
            {recentBooks.map(book => (
              <div key={book._id} style={styles.bookItem}>
                <div style={styles.bookIcon}>📖</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{book.title}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>{book.author} · {book.department}</div>
                </div>
                <span className={`badge ${book.availableCopies > 0 ? 'badge-success' : 'badge-warning'}`}>
                  {book.availableCopies > 0 ? 'Available' : 'Issued'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: 16, marginBottom: 24,
  },
  statIcon: { width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  cardHeader: { padding: '14px 20px', borderBottom: '1px solid #e5e7eb' },
  cardTitle: { fontSize: 15, fontWeight: 600 },
  bookItem: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 20px', borderBottom: '1px solid #f3f4f6',
  },
  bookIcon: { fontSize: 22 },
};
