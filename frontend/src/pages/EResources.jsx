import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { FiExternalLink } from 'react-icons/fi';

const typeIcons = {
  journal: '📰', ebook: '📖', database: '🗄️',
  research_paper: '🔬', video: '🎥',
};

export default function EResources() {
  const [type, setType] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['eresources', type],
    queryFn: () => api.get('/eresources', { params: { type } }).then(r => r.data.data),
  });

  const resources = data || [];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>💻 E-Resources</h1>
        <p style={styles.sub}>Access digital journals, e-books and research databases</p>
      </div>

      {/* Type filter */}
      <div style={styles.filters}>
        {['', 'journal', 'ebook', 'database', 'research_paper', 'video'].map(t => (
          <button
            key={t}
            className={`btn ${type === t ? 'btn-primary' : 'btn-outline'} btn-sm`}
            onClick={() => setType(t)}
          >
            {t ? `${typeIcons[t]} ${t.replace('_', ' ')}` : 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : resources.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48 }}>💻</div>
          <p>No e-resources available yet.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {resources.map(r => (
            <div key={r._id} className="card" style={styles.resourceCard}>
              <div style={styles.resourceIcon}>{typeIcons[r.type] || '📄'}</div>
              <div style={{ flex: 1 }}>
                <div style={styles.resourceTitle}>{r.title}</div>
                <div style={styles.resourceType}>
                  <span className="badge badge-info">{r.type.replace('_', ' ')}</span>
                  {r.department && <span className="badge badge-gray" style={{ marginLeft: 6 }}>{r.department}</span>}
                </div>
                {r.description && <p style={styles.resourceDesc}>{r.description}</p>}
              </div>
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                <FiExternalLink size={13} /> Access
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: 1200, margin: '0 auto', padding: '28px 20px' },
  header: { marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 700 },
  sub: { color: '#6b7280', marginTop: 4 },
  filters: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 },
  grid: { display: 'flex', flexDirection: 'column', gap: 12 },
  resourceCard: { display: 'flex', alignItems: 'center', gap: 16 },
  resourceIcon: { fontSize: 32, flexShrink: 0 },
  resourceTitle: { fontSize: 15, fontWeight: 600, marginBottom: 6 },
  resourceType: { marginBottom: 6 },
  resourceDesc: { fontSize: 13, color: '#6b7280' },
};
