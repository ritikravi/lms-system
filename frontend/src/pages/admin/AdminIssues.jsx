import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiPlus, FiRotateCcw } from 'react-icons/fi';

const statusBadge = (status) => {
  const map = { issued: 'badge-info', returned: 'badge-success', overdue: 'badge-danger' };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
};

export default function AdminIssues() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueForm, setIssueForm] = useState({ bookId: '', userId: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['adminIssues', statusFilter, page],
    queryFn: () => api.get('/issues', { params: { status: statusFilter, page, limit: 15 } }).then(r => r.data),
    keepPreviousData: true,
  });

  const issues = data?.data || [];
  const pagination = data?.pagination;

  const issueMutation = useMutation({
    mutationFn: (data) => api.post('/issues', data),
    onSuccess: () => { toast.success('Book issued successfully'); qc.invalidateQueries(['adminIssues']); setShowIssueModal(false); setIssueForm({ bookId: '', userId: '' }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to issue'),
  });

  const returnMutation = useMutation({
    mutationFn: (id) => api.put(`/issues/${id}/return`),
    onSuccess: (res) => {
      const fine = res.data.fine;
      toast.success(fine > 0 ? `Book returned. Fine: ₹${fine}` : 'Book returned successfully');
      qc.invalidateQueries(['adminIssues']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  return (
    <div>
      <div style={styles.topBar}>
        <div className="page-header" style={{ margin: 0 }}>
          <h1>Issue Management</h1>
          <p>Issue and return books, track overdue</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowIssueModal(true)}><FiPlus /> Issue Book</button>
      </div>

      {/* Status filter */}
      <div style={styles.filters}>
        {[
          { value: '', label: 'All' },
          { value: 'issued', label: 'Issued' },
          { value: 'overdue', label: 'Overdue' },
          { value: 'returned', label: 'Returned' },
        ].map(f => (
          <button key={f.value} className={`btn btn-sm ${statusFilter === f.value ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => { setStatusFilter(f.value); setPage(1); }}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0 }}>
        {isLoading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>BOOK</th><th>STUDENT</th><th>ISSUE DATE</th><th>DUE DATE</th><th>STATUS</th><th>FINE</th><th>ACTION</th></tr>
                </thead>
                <tbody>
                  {issues.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>No records found</td></tr>
                  ) : issues.map(issue => (
                    <tr key={issue._id}>
                      <td>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{issue.book?.title}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af' }}>{issue.book?.isbn}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: 13 }}>{issue.user?.name}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af' }}>{issue.user?.regNo}</div>
                      </td>
                      <td style={{ fontSize: 13 }}>{new Date(issue.issueDate).toLocaleDateString()}</td>
                      <td style={{ fontSize: 13, color: new Date(issue.dueDate) < new Date() && issue.status !== 'returned' ? '#dc2626' : 'inherit' }}>
                        {new Date(issue.dueDate).toLocaleDateString()}
                      </td>
                      <td>{statusBadge(issue.status)}</td>
                      <td style={{ color: issue.fineAmount > 0 ? '#dc2626' : 'inherit', fontWeight: issue.fineAmount > 0 ? 600 : 400 }}>
                        {issue.fineAmount > 0 ? `₹${issue.fineAmount}` : '—'}
                      </td>
                      <td>
                        {issue.status !== 'returned' && (
                          <button className="btn btn-outline btn-sm" onClick={() => { if (confirm('Mark as returned?')) returnMutation.mutate(issue._id); }}>
                            <FiRotateCcw size={13} /> Return
                          </button>
                        )}
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

      {/* Issue Modal */}
      {showIssueModal && (
        <div className="modal-overlay" onClick={() => setShowIssueModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Issue Book to Student</h3>
              <button className="modal-close" onClick={() => setShowIssueModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Book ID (MongoDB ID)</label>
                <input className="form-control" placeholder="Enter book _id" value={issueForm.bookId} onChange={e => setIssueForm({ ...issueForm, bookId: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Student ID (MongoDB ID)</label>
                <input className="form-control" placeholder="Enter student _id" value={issueForm.userId} onChange={e => setIssueForm({ ...issueForm, userId: e.target.value })} />
              </div>
              <p style={{ fontSize: 12, color: '#9ca3af' }}>Tip: Copy IDs from the Users and Books pages.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowIssueModal(false)}>Cancel</button>
              <button className="btn btn-primary" disabled={issueMutation.isPending}
                onClick={() => issueMutation.mutate(issueForm)}>
                {issueMutation.isPending ? 'Issuing...' : 'Issue Book'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  filters: { display: 'flex', gap: 8, marginBottom: 16 },
};
