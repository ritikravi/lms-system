import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';

const emptyBook = { title: '', author: '', isbn: '', department: '', subject: '', publisher: '', edition: '', year: '', totalCopies: 1, availableCopies: 1, description: '' };

const statusBadge = (status) => {
  const map = { available: 'badge-success', issued: 'badge-warning', reserved: 'badge-info' };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
};

export default function AdminBooks() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [form, setForm] = useState(emptyBook);

  const { data, isLoading } = useQuery({
    queryKey: ['adminBooks', search, page],
    queryFn: () => api.get('/books', { params: { search, page, limit: 15 } }).then(r => r.data),
    keepPreviousData: true,
  });

  const books = data?.data || [];
  const pagination = data?.pagination;

  const openAdd = () => { setForm(emptyBook); setEditBook(null); setShowModal(true); };
  const openEdit = (book) => { setForm({ ...book }); setEditBook(book._id); setShowModal(true); };

  const saveMutation = useMutation({
    mutationFn: (data) => editBook ? api.put(`/books/${editBook}`, data) : api.post('/books', data),
    onSuccess: () => {
      toast.success(editBook ? 'Book updated' : 'Book added');
      qc.invalidateQueries(['adminBooks']);
      setShowModal(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/books/${id}`),
    onSuccess: () => { toast.success('Book deleted'); qc.invalidateQueries(['adminBooks']); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(form);
  };

  return (
    <div>
      <div style={styles.topBar}>
        <div className="page-header" style={{ margin: 0 }}>
          <h1>Books Management</h1>
          <p>Add, edit and manage library books</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><FiPlus /> Add Book</button>
      </div>

      {/* Search */}
      <div style={styles.searchWrap}>
        <div className="search-bar">
          <input type="text" placeholder="Search books by title, author, ISBN..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          <button type="button"><FiSearch /></button>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        {isLoading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>TITLE</th><th>AUTHOR</th><th>ISBN</th><th>DEPT</th><th>COPIES</th><th>STATUS</th><th>ACTIONS</th></tr>
                </thead>
                <tbody>
                  {books.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>No books found</td></tr>
                  ) : books.map(book => (
                    <tr key={book._id}>
                      <td style={{ fontWeight: 500, maxWidth: 200 }}>{book.title}</td>
                      <td>{book.author}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{book.isbn}</td>
                      <td><span className="badge badge-gray">{book.department}</span></td>
                      <td>{book.availableCopies}/{book.totalCopies}</td>
                      <td>{statusBadge(book.status)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => openEdit(book)}><FiEdit2 size={13} /></button>
                          <button className="btn btn-danger btn-sm" onClick={() => { if (confirm('Delete this book?')) deleteMutation.mutate(book._id); }}><FiTrash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination && pagination.pages > 1 && (
              <div className="pagination" style={{ padding: '16px 0' }}>
                <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => (
                  <button key={i + 1} className={`page-btn ${page === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
                ))}
                <button className="page-btn" onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}>›</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editBook ? 'Edit Book' : 'Add New Book'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div style={styles.formGrid}>
                  {[
                    { key: 'title', label: 'Title *', required: true },
                    { key: 'author', label: 'Author *', required: true },
                    { key: 'isbn', label: 'ISBN *', required: true },
                    { key: 'department', label: 'Department *', required: true },
                    { key: 'subject', label: 'Subject' },
                    { key: 'publisher', label: 'Publisher' },
                    { key: 'edition', label: 'Edition' },
                    { key: 'year', label: 'Year', type: 'number' },
                    { key: 'totalCopies', label: 'Total Copies', type: 'number', required: true },
                    { key: 'availableCopies', label: 'Available Copies', type: 'number', required: true },
                  ].map(f => (
                    <div key={f.key} className="form-group">
                      <label>{f.label}</label>
                      <input
                        type={f.type || 'text'}
                        className="form-control"
                        value={form[f.key] || ''}
                        onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                        required={f.required}
                      />
                    </div>
                  ))}
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea className="form-control" rows={3} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Saving...' : (editBook ? 'Update' : 'Add Book')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  searchWrap: { marginBottom: 16 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
};
