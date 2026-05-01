import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

const emptyNotice = { title: '', content: '', type: 'general', isActive: true };

export default function AdminNotices() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editNotice, setEditNotice] = useState(null);
  const [form, setForm] = useState(emptyNotice);

  const { data: notices = [], isLoading } = useQuery({
    queryKey: ['adminNotices'],
    queryFn: () => api.get('/notices').then(r => r.data.data),
  });

  const openAdd = () => { setForm(emptyNotice); setEditNotice(null); setShowModal(true); };
  const openEdit = (n) => { setForm({ ...n }); setEditNotice(n._id); setShowModal(true); };

  const saveMutation = useMutation({
    mutationFn: (data) => editNotice ? api.put(`/notices/${editNotice}`, data) : api.post('/notices', data),
    onSuccess: () => { toast.success(editNotice ? 'Notice updated' : 'Notice created'); qc.invalidateQueries(['adminNotices']); setShowModal(false); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/notices/${id}`),
    onSuccess: () => { toast.success('Notice deleted'); qc.invalidateQueries(['adminNotices']); },
  });

  const typeColors = { general: 'badge-info', holiday: 'badge-warning', event: 'badge-success', alert: 'badge-danger', policy: 'badge-gray' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div className="page-header" style={{ margin: 0 }}>
          <h1>Notices</h1>
          <p>Manage library announcements and notices</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><FiPlus /> Add Notice</button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {notices.length === 0 ? (
            <div className="empty-state"><p>No notices yet. Add one!</p></div>
          ) : notices.map(n => (
            <div key={n._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{n.title}</span>
                  <span className={`badge ${typeColors[n.type] || 'badge-gray'}`}>{n.type}</span>
                  {!n.isActive && <span className="badge badge-danger">Inactive</span>}
                </div>
                <p style={{ fontSize: 14, color: '#4b5563', marginBottom: 6 }}>{n.content}</p>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>
                  {new Date(n.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginLeft: 16 }}>
                <button className="btn btn-outline btn-sm" onClick={() => openEdit(n)}><FiEdit2 size={13} /></button>
                <button className="btn btn-danger btn-sm" onClick={() => { if (confirm('Delete notice?')) deleteMutation.mutate(n._id); }}><FiTrash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editNotice ? 'Edit Notice' : 'Add Notice'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Title *</label>
                  <input className="form-control" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Content *</label>
                  <textarea className="form-control" rows={4} required value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select className="form-control" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option value="general">General</option>
                    <option value="holiday">Holiday</option>
                    <option value="event">Event</option>
                    <option value="alert">Alert</option>
                    <option value="policy">Policy</option>
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
                    Active (visible to students)
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Saving...' : (editNotice ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
