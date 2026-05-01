import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiCheckCircle } from 'react-icons/fi';

export default function AdminFines() {
  const qc = useQueryClient();
  const [paidFilter, setPaidFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['adminFines', paidFilter],
    queryFn: () => api.get('/fines', { params: paidFilter !== '' ? { paid: paidFilter } : {} }).then(r => r.data),
  });

  const fines = data?.data || [];
  const summary = data?.summary;

  const payMutation = useMutation({
    mutationFn: (id) => api.put(`/fines/${id}/pay`),
    onSuccess: () => { toast.success('Fine marked as paid'); qc.invalidateQueries(['adminFines']); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  return (
    <div>
      <div className="page-header">
        <h1>Fine Management</h1>
        <p>Track and collect overdue fines</p>
      </div>

      {/* Summary */}
      {summary && (
        <div style={styles.summaryGrid}>
          <div className="stat-card">
            <div className="stat-value">₹{summary.totalAmount}</div>
            <div className="stat-label">Total Fines</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#16a34a' }}>₹{summary.totalPaid}</div>
            <div className="stat-label">Collected</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#dc2626' }}>₹{summary.totalPending}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[{ v: '', l: 'All' }, { v: 'false', l: 'Pending' }, { v: 'true', l: 'Paid' }].map(f => (
          <button key={f.v} className={`btn btn-sm ${paidFilter === f.v ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setPaidFilter(f.v)}>{f.l}</button>
        ))}
      </div>

      <div className="card" style={{ padding: 0 }}>
        {isLoading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>STUDENT</th><th>BOOK</th><th>DUE DATE</th><th>RETURN DATE</th><th>FINE</th><th>STATUS</th><th>ACTION</th></tr>
              </thead>
              <tbody>
                {fines.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>No fines found</td></tr>
                ) : fines.map(issue => (
                  <tr key={issue._id}>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{issue.user?.name}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{issue.user?.regNo}</div>
                    </td>
                    <td style={{ fontSize: 13 }}>{issue.book?.title}</td>
                    <td style={{ fontSize: 13 }}>{new Date(issue.dueDate).toLocaleDateString()}</td>
                    <td style={{ fontSize: 13 }}>{issue.returnDate ? new Date(issue.returnDate).toLocaleDateString() : '—'}</td>
                    <td style={{ fontWeight: 700, color: '#dc2626' }}>₹{issue.fineAmount}</td>
                    <td>{issue.finePaid ? <span className="badge badge-success">Paid</span> : <span className="badge badge-danger">Pending</span>}</td>
                    <td>
                      {!issue.finePaid && (
                        <button className="btn btn-sm" style={{ background: '#16a34a', color: 'white' }}
                          onClick={() => payMutation.mutate(issue._id)} disabled={payMutation.isPending}>
                          <FiCheckCircle size={13} /> Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 },
};
