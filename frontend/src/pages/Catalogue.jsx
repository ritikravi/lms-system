import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { FiSearch, FiFilter } from 'react-icons/fi';

const statusBadge = (status) => {
  const map = { available: 'badge-success', issued: 'badge-warning', reserved: 'badge-info', lost: 'badge-danger' };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
};

export default function Catalogue() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [field, setField] = useState(searchParams.get('field') || 'all');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['catalogue', search, field, department, status, page],
    queryFn: () => api.get('/catalogue', {
      params: { search, department, status, page, limit: 12 }
    }).then(r => r.data),
    keepPreviousData: true,
  });

  const books = data?.data || [];
  const departments = data?.departments || [];
  const pagination = data?.pagination;

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>📚 Book Catalogue</h1>
        <p style={styles.sub}>Browse our complete collection of books and resources</p>
      </div>

      {/* Filters */}
      <div style={styles.filtersCard}>
        <form onSubmit={handleSearch} style={styles.filtersRow}>
          <div className="search-bar" style={{ flex: 1 }}>
            <select value={field} onChange={e => setField(e.target.value)}>
              <option value="all">All Fields</option>
              <option value="title">Title</option>
              <option value="author">Author</option>
              <option value="isbn">ISBN</option>
              <option value="subject">Subject</option>
            </select>
            <input
              type="text"
              placeholder="Search books..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="submit">Search</button>
          </div>

          <select
            className="form-control"
            style={{ width: 180 }}
            value={department}
            onChange={e => { setDepartment(e.target.value); setPage(1); }}
          >
            <option value="">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <select
            className="form-control"
            style={{ width: 140 }}
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="issued">Issued</option>
            <option value="reserved">Reserved</option>
          </select>
        </form>
      </div>

      {/* Results */}
      <div className="card" style={{ padding: 0 }}>
        {isLoading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : (
          <>
            <div style={styles.resultsHeader}>
              <span style={{ fontSize: 14, color: '#6b7280' }}>
                {pagination?.total || 0} books found
              </span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>BOOK TITLE</th>
                    <th>AUTHOR</th>
                    <th>DEPARTMENT</th>
                    <th>ISBN</th>
                    <th>COPIES</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {books.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
                        No books found
                      </td>
                    </tr>
                  ) : books.map((book, i) => (
                    <tr key={book._id}>
                      <td style={{ color: '#9ca3af' }}>{(page - 1) * 12 + i + 1}</td>
                      <td style={{ fontWeight: 500 }}>{book.title}</td>
                      <td>{book.author}</td>
                      <td><span className="badge badge-gray">{book.department}</span></td>
                      <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{book.isbn}</td>
                      <td>{book.availableCopies}/{book.totalCopies}</td>
                      <td>{statusBadge(book.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="pagination" style={{ padding: '16px 0' }}>
                <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>
                      {p}
                    </button>
                  );
                })}
                <button className="page-btn" onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}>›</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: 1200, margin: '0 auto', padding: '28px 20px' },
  header: { marginBottom: 24 },
  title: { fontSize: 26, fontWeight: 700 },
  sub: { color: '#6b7280', marginTop: 4 },
  filtersCard: {
    background: 'white', borderRadius: 10, padding: 16,
    marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  filtersRow: { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' },
  resultsHeader: { padding: '12px 16px', borderBottom: '1px solid #e5e7eb' },
};
