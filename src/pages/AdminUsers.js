import React, { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser, getUserEnrollments } from '../services/api';
import Toast from '../components/Toast';

const emptyForm = { name: '', email: '', password: '', role: 'student' };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [search, setSearch] = useState('');
  const [enrollCounts, setEnrollCounts] = useState({});

  const load = async () => {
    const res = await getUsers();
    setUsers(res.data);
    // Fetch enrollment counts for each user
    const counts = {};
    await Promise.all(
      res.data.map(async u => {
        const eRes = await getUserEnrollments(u.id);
        counts[u.id] = eRes.data.length;
      })
    );
    setEnrollCounts(counts);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowModal(true); };
  const openEdit = (user) => { setForm({ ...user, password: user.password || '' }); setEditId(user.id); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditId(null); setForm(emptyForm); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateUser(editId, { ...form });
        setToast({ message: 'User updated successfully!', type: 'success' });
      } else {
        await createUser({ ...form, enrolledCourses: [], progress: {} });
        setToast({ message: 'User created successfully!', type: 'success' });
      }
      closeModal();
      load();
    } catch {
      setToast({ message: 'Operation failed', type: 'danger' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      setDeleteConfirm(null);
      setToast({ message: 'User deleted', type: 'success' });
      load();
    } catch {
      setToast({ message: 'Delete failed', type: 'danger' });
    }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const roleBadge = (role) => (
    <span className={`badge rounded-pill ${role === 'admin' ? 'bg-danger' : 'bg-success'} bg-opacity-15 text-${role === 'admin' ? 'danger' : 'success'}`}>
      <i className={`bi bi-${role === 'admin' ? 'shield-check' : 'person'} me-1`}></i>{role}
    </span>
  );

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <div className="section-tag">Management</div>
          <h2 className="mb-0" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Users</h2>
        </div>
        <button className="btn btn-primary rounded-pill" onClick={openAdd}>
          <i className="bi bi-person-plus me-2"></i>Add User
        </button>
      </div>

      <div className="mb-3">
        <input
          className="form-control"
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ borderRadius: 'var(--radius-sm)', maxWidth: 320 }}
        />
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
      ) : (
        <div className="card border-0 shadow-sm" style={{ borderRadius: 'var(--radius)' }}>
          <div className="table-responsive">
            <table className="table lms-table mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Enrollments</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-4 text-muted">No users found</td></tr>
                ) : (
                  filtered.map((user, i) => (
                    <tr key={user.id}>
                      <td className="text-muted">{i + 1}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="navbar-avatar" style={{ width: 32, height: 32, fontSize: '0.75rem', flexShrink: 0 }}>
                            {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <span className="fw-semibold">{user.name}</span>
                        </div>
                      </td>
                      <td className="text-muted small">{user.email}</td>
                      <td>{roleBadge(user.role)}</td>
                      <td>
                        <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill">
                          {enrollCounts[user.id] || 0} courses
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <button className="btn btn-sm btn-outline-primary rounded-pill" onClick={() => openEdit(user)}>
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-danger rounded-pill" onClick={() => setDeleteConfirm(user.id)}>
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editId ? 'Edit User' : 'Add New User'}</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Full Name *</label>
                      <input name="name" className="form-control" value={form.name}
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="John Doe" />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Email *</label>
                      <input name="email" type="email" className="form-control" value={form.email}
                        onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required placeholder="john@example.com" />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Password *</label>
                      <input name="password" type="text" className="form-control" value={form.password}
                        onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required placeholder="Set password" />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Role</label>
                      <select className="form-select" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                        <option value="student">Student</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="btn btn-primary">
                    <i className={`bi bi-${editId ? 'check-lg' : 'person-plus'} me-2`}></i>
                    {editId ? 'Update User' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-body text-center p-4">
                <div style={{ fontSize: '2.5rem' }}>⚠️</div>
                <h5 className="mt-2 mb-1">Delete User?</h5>
                <p className="text-muted small">This will permanently remove the user.</p>
                <div className="d-flex gap-2 justify-content-center mt-3">
                  <button className="btn btn-light" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast-container">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}
    </>
  );
}
