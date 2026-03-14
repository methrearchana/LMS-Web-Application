import React, { useState, useEffect } from 'react';
import {
  getEnrollments, getCourses, getUsers,
  createEnrollment, updateEnrollment, deleteEnrollment
} from '../services/api';
import Toast from '../components/Toast';

export default function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ userId: '', courseId: '', progress: 0, enrolledAt: new Date().toISOString().split('T')[0], completedLessons: [] });
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [search, setSearch] = useState('');

  const load = async () => {
    const [eRes, cRes, uRes] = await Promise.all([getEnrollments(), getCourses(), getUsers()]);
    setEnrollments(eRes.data);
    setCourses(cRes.data);
    setUsers(uRes.data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const getUserName = (id) => users.find(u => u.id === parseInt(id))?.name || 'Unknown';
  const getCourseName = (id) => courses.find(c => c.id === parseInt(id))?.title || 'Unknown';

  const openAdd = () => {
    setForm({ userId: users.find(u => u.role !== 'admin')?.id || '', courseId: courses[0]?.id || '', progress: 0, enrolledAt: new Date().toISOString().split('T')[0], completedLessons: [] });
    setEditId(null);
    setShowModal(true);
  };
  const openEdit = (e) => {
    setForm({ userId: e.userId, courseId: e.courseId, progress: e.progress, enrolledAt: e.enrolledAt, completedLessons: e.completedLessons || [] });
    setEditId(e.id);
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditId(null); };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    try {
      const data = { ...form, userId: parseInt(form.userId), courseId: parseInt(form.courseId), progress: parseInt(form.progress) };
      if (editId) {
        await updateEnrollment(editId, data);
        setToast({ message: 'Enrollment updated!', type: 'success' });
      } else {
        await createEnrollment(data);
        setToast({ message: 'Enrollment created!', type: 'success' });
      }
      closeModal();
      load();
    } catch {
      setToast({ message: 'Operation failed', type: 'danger' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteEnrollment(id);
      setDeleteConfirm(null);
      setToast({ message: 'Enrollment deleted', type: 'success' });
      load();
    } catch {
      setToast({ message: 'Delete failed', type: 'danger' });
    }
  };

  const filtered = enrollments.filter(e => {
    const name = getUserName(e.userId).toLowerCase();
    const title = getCourseName(e.courseId).toLowerCase();
    return name.includes(search.toLowerCase()) || title.includes(search.toLowerCase());
  });

  const progressColor = (p) => p >= 100 ? 'success' : p >= 50 ? 'primary' : 'warning';

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <div className="section-tag">Management</div>
          <h2 className="mb-0" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Enrollments</h2>
        </div>
        <button className="btn btn-primary rounded-pill" onClick={openAdd}>
          <i className="bi bi-journal-plus me-2"></i>Add Enrollment
        </button>
      </div>

      <div className="mb-3">
        <input
          className="form-control"
          placeholder="Search by student or course..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ borderRadius: 'var(--radius-sm)', maxWidth: 360 }}
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
                  <th>Student</th>
                  <th>Course</th>
                  <th>Enrolled On</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-4 text-muted">No enrollments found</td></tr>
                ) : (
                  filtered.map((e, i) => (
                    <tr key={e.id}>
                      <td className="text-muted">{i + 1}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="navbar-avatar" style={{ width: 28, height: 28, fontSize: '0.7rem' }}>
                            {getUserName(e.userId)?.[0] || '?'}
                          </div>
                          {getUserName(e.userId)}
                        </div>
                      </td>
                      <td>
                        <span className="fw-semibold">{getCourseName(e.courseId)}</span>
                      </td>
                      <td><small className="text-muted">{e.enrolledAt}</small></td>
                      <td style={{ minWidth: 140 }}>
                        <div className="d-flex align-items-center gap-2">
                          <div className="progress flex-grow-1" style={{ height: 6 }}>
                            <div className={`progress-bar bg-${progressColor(e.progress)}`} style={{ width: `${e.progress}%` }}></div>
                          </div>
                          <small className="fw-bold" style={{ width: 36 }}>{e.progress}%</small>
                        </div>
                      </td>
                      <td>
                        <span className={`badge rounded-pill bg-${e.progress === 100 ? 'success' : 'warning'} bg-opacity-15 text-${e.progress === 100 ? 'success' : 'warning'}`}>
                          {e.progress === 100 ? 'Completed' : 'In Progress'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <button className="btn btn-sm btn-outline-primary rounded-pill" onClick={() => openEdit(e)}>
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-danger rounded-pill" onClick={() => setDeleteConfirm(e.id)}>
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
                <h5 className="modal-title">{editId ? 'Edit Enrollment' : 'Add Enrollment'}</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Student *</label>
                      <select className="form-select" value={form.userId} onChange={e => setForm(p => ({ ...p, userId: e.target.value }))} required>
                        <option value="">-- Select Student --</option>
                        {users.filter(u => u.role !== 'admin').map(u => (
                          <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Course *</label>
                      <select className="form-select" value={form.courseId} onChange={e => setForm(p => ({ ...p, courseId: e.target.value }))} required>
                        <option value="">-- Select Course --</option>
                        {courses.map(c => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Enrolled Date</label>
                      <input type="date" className="form-control" value={form.enrolledAt} onChange={e => setForm(p => ({ ...p, enrolledAt: e.target.value }))} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Progress (%)</label>
                      <input type="number" min="0" max="100" className="form-control" value={form.progress} onChange={e => setForm(p => ({ ...p, progress: parseInt(e.target.value) || 0 }))} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="btn btn-primary">
                    <i className={`bi bi-${editId ? 'check-lg' : 'journal-plus'} me-2`}></i>
                    {editId ? 'Update' : 'Create Enrollment'}
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
                <div style={{ fontSize: '2.5rem' }}>📋</div>
                <h5 className="mt-2 mb-1">Remove Enrollment?</h5>
                <p className="text-muted small">Student will lose access to this course.</p>
                <div className="d-flex gap-2 justify-content-center mt-3">
                  <button className="btn btn-light" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>Remove</button>
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
