import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { FiSearch, FiBook, FiBookmark, FiMonitor, FiDollarSign, FiBarChart2, FiAward } from 'react-icons/fi';

const services = [
  { icon: '📖', title: 'Book Issue & Return', desc: 'Issue books, track due dates and manage returns easily.' },
  { icon: '🔖', title: 'Book Reservation', desc: 'Reserve books in advance and get notified when available.' },
  { icon: '💻', title: 'E-Resources', desc: 'Access digital journals, e-books and research databases.' },
  { icon: '📋', title: 'Fine Management', desc: 'View and pay overdue fines online with ease.' },
  { icon: '📊', title: 'Reading History', desc: 'Track your borrowing history and reading progress.' },
  { icon: '🎓', title: 'Student Portal', desc: 'Manage your library account, ID and membership.' },
];

const statusBadge = (status) => {
  const map = { available: 'badge-success', issued: 'badge-warning', reserved: 'badge-info', lost: 'badge-danger' };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
};

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchField, setSearchField] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: dashData } = useQuery({
    queryKey: ['publicDashboard'],
    queryFn: () => api.get('/dashboard/public').then(r => r.data.data),
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalogue?search=${encodeURIComponent(searchQuery)}&field=${searchField}`);
    }
  };

  const stats = dashData?.stats;
  const notices = dashData?.notices || [];
  const recentBooks = dashData?.recentBooks || [];
  const timings = dashData?.libraryTimings;

  return (
    <div>
      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroOverlay} />
        <div style={styles.heroContent}>
          <div style={styles.heroLeft}>
            <div style={styles.heroBadge}>🏛️ WELCOME TO LPU CENTRAL LIBRARY</div>
            <h1 style={styles.heroTitle}>
              Library Management<br />
              <span style={{ color: '#C9A84C' }}>System</span>
            </h1>
            <p style={styles.heroDesc}>
              Access thousands of books, research papers, journals and digital resources
              at Lovely Professional University's state-of-the-art library.
            </p>
            <div style={styles.heroBtns}>
              <button className="btn btn-gold btn-lg" onClick={() => navigate('/catalogue')}>
                🔍 Search Books
              </button>
              <button className="btn btn-outline btn-lg" style={{ color: 'white', borderColor: 'white' }}
                onClick={() => navigate('/catalogue')}>
                📚 Browse Catalogue
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={styles.statsBar}>
        {[
          { value: stats ? `${(stats.totalBooks / 1000).toFixed(0)}K+` : '1,20,000+', label: 'Total Books' },
          { value: stats ? `${stats.eJournals || 5400}+` : '5,400+', label: 'E-Journals' },
          { value: stats ? `${(stats.registeredUsers / 1000).toFixed(0)}K+` : '28,000+', label: 'Registered Users' },
          { value: stats ? `${stats.dailyIssues || 350}+` : '350+', label: 'Daily Issues' },
          { value: '24/7', label: 'Online Access' },
        ].map((s, i) => (
          <div key={i} style={styles.statItem}>
            <div style={styles.statValue}>{s.value}</div>
            <div style={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={styles.searchSection}>
        <h2 style={styles.sectionTitle}>🔍 Find Your Book</h2>
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <div className="search-bar" style={{ maxWidth: 600, width: '100%' }}>
            <select value={searchField} onChange={e => setSearchField(e.target.value)}>
              <option value="all">All Fields</option>
              <option value="title">Title</option>
              <option value="author">Author</option>
              <option value="isbn">ISBN</option>
              <option value="subject">Subject</option>
            </select>
            <input
              type="text"
              placeholder="Search by title, author, ISBN or subject..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button type="submit">Search</button>
          </div>
        </form>
      </div>

      {/* Services */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Our Services</h2>
          <p style={styles.sectionSub}>Everything you need to manage your library experience</p>
        </div>
        <div style={styles.servicesGrid}>
          {services.map((s, i) => (
            <div key={i} style={styles.serviceCard}>
              <div style={styles.serviceIcon}>{s.icon}</div>
              <h3 style={styles.serviceTitle}>{s.title}</h3>
              <p style={styles.serviceDesc}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recently Added Books */}
      <div style={styles.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={styles.cardTitle}>📗 Recently Added Books</h2>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/catalogue')}>
            View All →
          </button>
        </div>
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>BOOK TITLE</th>
                  <th>AUTHOR</th>
                  <th>DEPARTMENT</th>
                  <th>ISBN</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {recentBooks.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>No books yet</td></tr>
                ) : recentBooks.map(book => (
                  <tr key={book._id}>
                    <td style={{ fontWeight: 500 }}>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.department}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{book.isbn}</td>
                    <td>{statusBadge(book.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Notices + Timings */}
      <div style={{ ...styles.section, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Notices */}
        <div className="card" style={{ padding: 0 }}>
          <div style={styles.cardHeaderRed}>
            <h3 style={styles.cardHeaderTitle}>📢 Library Notices</h3>
          </div>
          <div style={{ padding: '16px 20px' }}>
            {notices.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: 14 }}>No notices at this time.</p>
            ) : notices.map(n => (
              <div key={n._id} style={styles.noticeItem}>
                <div style={styles.noticeDot} />
                <div>
                  <div style={styles.noticeTitle}>{n.title}</div>
                  <div style={styles.noticeDate}>{new Date(n.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timings */}
        <div className="card" style={{ padding: 0 }}>
          <div style={styles.cardHeaderRed}>
            <h3 style={styles.cardHeaderTitle}>🕐 Library Timings & Info</h3>
          </div>
          <div style={{ padding: '16px 20px' }}>
            {[
              { label: 'Monday – Friday: 8:00 AM – 10:00 PM', sub: 'Regular Hours' },
              { label: 'Saturday: 9:00 AM – 6:00 PM', sub: 'Weekend Hours' },
              { label: timings?.issueLimit || 'Issue Limit: 4 books per student (14 days)', sub: 'Library Policy' },
              { label: timings?.fine || 'Fine: ₹2 per day per book after due date', sub: 'Fine Policy' },
            ].map((t, i) => (
              <div key={i} style={styles.noticeItem}>
                <div style={{ ...styles.noticeDot, background: '#C9A84C' }} />
                <div>
                  <div style={styles.noticeTitle}>{t.label}</div>
                  <div style={styles.noticeDate}>{t.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  hero: {
    position: 'relative', minHeight: 420,
    background: 'linear-gradient(135deg, #8B1A1A 0%, #4a0e0e 100%)',
    display: 'flex', alignItems: 'center', overflow: 'hidden',
  },
  heroOverlay: {
    position: 'absolute', inset: 0,
    background: 'url("https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200") center/cover',
    opacity: 0.15,
  },
  heroContent: {
    position: 'relative', maxWidth: 1200, margin: '0 auto',
    padding: '60px 40px', width: '100%',
  },
  heroLeft: { maxWidth: 600 },
  heroBadge: {
    display: 'inline-block', background: 'rgba(201,168,76,0.2)',
    color: '#C9A84C', padding: '6px 14px', borderRadius: 20,
    fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', marginBottom: 16,
  },
  heroTitle: { fontSize: 48, fontWeight: 800, color: 'white', lineHeight: 1.15, marginBottom: 16 },
  heroDesc: { color: 'rgba(255,255,255,0.8)', fontSize: 16, lineHeight: 1.7, marginBottom: 28 },
  heroBtns: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  statsBar: {
    background: 'white', borderBottom: '1px solid #e5e7eb',
    display: 'flex', justifyContent: 'center', flexWrap: 'wrap',
  },
  statItem: {
    padding: '20px 40px', textAlign: 'center',
    borderRight: '1px solid #e5e7eb',
  },
  statValue: { fontSize: 26, fontWeight: 800, color: '#8B1A1A' },
  statLabel: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  searchSection: {
    background: 'white', padding: '32px 40px',
    borderBottom: '1px solid #e5e7eb', textAlign: 'center',
  },
  searchForm: { display: 'flex', justifyContent: 'center', marginTop: 16 },
  section: { maxWidth: 1200, margin: '0 auto', padding: '32px 20px' },
  sectionHeader: { textAlign: 'center', marginBottom: 28 },
  sectionTitle: { fontSize: 26, fontWeight: 700, color: '#1a1a1a' },
  sectionSub: { color: '#6b7280', marginTop: 6 },
  servicesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: 16,
  },
  serviceCard: {
    background: 'white', borderRadius: 12, padding: '24px 20px',
    textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'default',
  },
  serviceIcon: { fontSize: 36, marginBottom: 12 },
  serviceTitle: { fontSize: 15, fontWeight: 600, marginBottom: 8 },
  serviceDesc: { fontSize: 13, color: '#6b7280', lineHeight: 1.6 },
  cardTitle: { fontSize: 18, fontWeight: 600 },
  cardHeaderRed: {
    background: '#8B1A1A', color: 'white',
    padding: '14px 20px', borderRadius: '12px 12px 0 0',
  },
  cardHeaderTitle: { fontSize: 15, fontWeight: 600 },
  noticeItem: { display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 },
  noticeDot: { width: 8, height: 8, borderRadius: '50%', background: '#8B1A1A', marginTop: 5, flexShrink: 0 },
  noticeTitle: { fontSize: 14, fontWeight: 500 },
  noticeDate: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
};
