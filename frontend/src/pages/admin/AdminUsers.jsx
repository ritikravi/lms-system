import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiUserX, FiSearch } from 'react-icons/fi';

const emptyUser = { regNo: '', name: '', email: '', password: '', role: 'student', department: '', course: '', phone: '' };

export default function AdminUsers() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('student');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState(emptyUser);

  const { data, isLoading } = useQuery({
    queryKey: ['adminUsers', search, roleFilter, page],
    queryFn: () => api.get('/users', { params: { search, role: roleFilter, page, limit: 15 } }).then(r => r.data),
    keepPreviousData: true,
  });

  const users = data?.data || [];
  const pagination = data?.pagination;

  const openAdd = () => { setForm(emptyUser); setEditUser(null); setShowModal(true); };
  const openEdit = (u) => { setForm({ ...u, password: '' }); setEditUser(u._id); setShowModal(true); };

  const saveMutation = useMutation({
    mutationFn: (data) => editUser ? api.put(`/users/${editUser}`, data) : api.post('/auth/register', data),
    onSuccess: () => { toast.success(editUser ? 'User updated' : 'User created'); qc.invalidateQueries(['adminUsers']); setShowModal(false); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id) => api.delete(`/users/${id}`),
    onSuccess: () => { toast.success('User deactivated'); qc.invalidateQueries(['adminUsers']); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  return (
    <div>
      <div style={styles.topBar}>
        <div className="page-header" style={{ margin: 0 }}>
          <h1>Users Management</h1>
          <p>Manage students and staff accounts</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><FiPlus /> Add User</button>
      </div>

      <div style={styles.filtersRow}>
        <div className="search-bar" style={{ flex: 1, maxWidth: 400 }}>
          <input type="text" placeholder="Search by name, reg no, email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          <button type="button"><FiSearch /></button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['student', 'librarian', 'admin'].map(r => (
            <button key={r} className={`btn btn-sm ${roleFilter === r ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => { setRoleFilter(r); setPage(1); }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {isLoading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>NAME</th><th>REG NO</th><th>EMAIL</th><th>DEPT</th><th>ROLE</th><th>STATUS</th><th>ACTIONS</th></tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>No users found</td></tr>
                ) : users.map(u => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 500 }}>{u.name}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{u.regNo}</td>
                    <td style={{ fontSize: 13 }}>{u.email}</td>
                    <td>{u.department || '—'}</td>
                    <td><span className="badge badge-info">{u.role}</span></td>
                    <td><span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(u)}><FiEdit2 size={13} /></button>
                        {u.isActive && (
                          <button className="btn btn-danger btn-sm" onClick={() => { if (confirm('Deactivate user?')) deactivateMutation.mutate(u._id); }}>
                            <FiUserX size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editUser ? 'Edit User' : 'Add New User'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }}>
              <div className="modal-body">
                <div style={styles.formGrid}>
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input className="form-control" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Reg No *</label>
                    <input className="form-control" required value={form.regNo} onChange={e => setForm({ ...form, regNo: e.target.value })} disabled={!!editUser} />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input type="email" className="form-control" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  </div>
                  {!editUser && (
                    <div className="form-group">
                      <label>Password *</label>
                      <input type="password" className="form-control" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                    </div>
                  )}
                  <div className="form-group">
                    <label>Role</label>
                    <select className="form-control" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                      <option value="student">Student</option>
                      <option value="librarian">Librarian</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Department</label>
                    <input className="form-control" value={form.department || ''} onChange={e => setForm({ ...form, department: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Course</label>
                    <input className="form-control" value={form.course || ''} onChange={e => setForm({ ...form, course: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input className="form-control" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Saving...' : (editUser ? 'Update' : 'Create User')}
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
  filtersRow: { display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
};
