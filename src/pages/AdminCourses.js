import React, { useState, useEffect } from 'react';
import { getCourses, createCourse, updateCourse, deleteCourse } from '../services/api';
import Toast from '../components/Toast';

const CATEGORIES = ['Web Development', 'Backend', 'Data Science', 'Design', 'Cloud'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const emptyForm = {
  title: '', instructor: '', duration: '', category: 'Web Development',
  level: 'Beginner', description: '', thumbnail: '', price: '', rating: 4.5, students: 0,
  lessons: [],
};

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [lessonInput, setLessonInput] = useState({ title: '', duration: '20 min', type: 'video' });
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [search, setSearch] = useState('');

  const load = () => {
    getCourses().then(r => { setCourses(r.data); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowModal(true); };
  const openEdit = (course) => {
    setForm({ ...course });
    setEditId(course.id);
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditId(null); setForm(emptyForm); };

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const addLesson = () => {
    if (!lessonInput.title) return;
    const newLesson = { id: Date.now(), ...lessonInput };
    setForm(prev => ({ ...prev, lessons: [...(prev.lessons || []), newLesson] }));
    setLessonInput({ title: '', duration: '20 min', type: 'video' });
  };
  const removeLesson = (id) => setForm(prev => ({ ...prev, lessons: prev.lessons.filter(l => l.id !== id) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form, price: parseFloat(form.price), rating: parseFloat(form.rating), students: parseInt(form.students) || 0 };
      if (editId) {
        await updateCourse(editId, data);
        setToast({ message: 'Course updated successfully!', type: 'success' });
      } else {
        await createCourse(data);
        setToast({ message: 'Course created successfully!', type: 'success' });
      }
      closeModal();
      load();
    } catch {
      setToast({ message: 'Operation failed', type: 'danger' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCourse(id);
      setDeleteConfirm(null);
      setToast({ message: 'Course deleted', type: 'success' });
      load();
    } catch {
      setToast({ message: 'Delete failed', type: 'danger' });
    }
  };

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.instructor?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <div className="section-tag">Management</div>
          <h2 className="mb-0" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Courses</h2>
        </div>
        <button className="btn btn-primary rounded-pill" onClick={openAdd}>
          <i className="bi bi-plus-lg me-2"></i>Add Course
        </button>
      </div>

      <div className="mb-3">
        <input
          className="form-control"
          placeholder="Search courses..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ borderRadius: 'var(--radius-sm)', maxWidth: 320 }}
        />
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
      ) : (
        <div className="card border-0 shadow-sm lms-table" style={{ borderRadius: 'var(--radius)' }}>
          <div className="table-responsive">
            <table className="table lms-table mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Course</th>
                  <th>Category</th>
                  <th>Level</th>
                  <th>Instructor</th>
                  <th>Price</th>
                  <th>Lessons</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-4 text-muted">No courses found</td></tr>
                ) : (
                  filtered.map((course, i) => (
                    <tr key={course.id}>
                      <td className="text-muted">{i + 1}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={course.thumbnail}
                            alt=""
                            style={{ width: 40, height: 28, objectFit: 'cover', borderRadius: 6 }}
                            onError={e => { e.target.src = 'https://placehold.co/40x28/4361ee/fff?text=C'; }}
                          />
                          <span className="fw-semibold">{course.title}</span>
                        </div>
                      </td>
                      <td><span className="badge bg-primary bg-opacity-10 text-primary">{course.category}</span></td>
                      <td><span className="badge bg-secondary bg-opacity-10 text-secondary">{course.level}</span></td>
                      <td>{course.instructor}</td>
                      <td className="fw-bold text-primary">${course.price}</td>
                      <td>{course.lessons?.length || 0}</td>
                      <td>
                        <div className="d-flex gap-1">
                          <button className="btn btn-sm btn-outline-primary rounded-pill" onClick={() => openEdit(course)}>
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-danger rounded-pill" onClick={() => setDeleteConfirm(course.id)}>
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editId ? 'Edit Course' : 'Add New Course'}</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Course Title *</label>
                      <input name="title" className="form-control" value={form.title} onChange={handleChange} required placeholder="e.g. React Fundamentals" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Instructor *</label>
                      <input name="instructor" className="form-control" value={form.instructor} onChange={handleChange} required placeholder="Instructor name" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Duration *</label>
                      <input name="duration" className="form-control" value={form.duration} onChange={handleChange} required placeholder="e.g. 8 hours" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Category</label>
                      <select name="category" className="form-select" value={form.category} onChange={handleChange}>
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Level</label>
                      <select name="level" className="form-select" value={form.level} onChange={handleChange}>
                        {LEVELS.map(l => <option key={l}>{l}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Price ($) *</label>
                      <input name="price" type="number" step="0.01" className="form-control" value={form.price} onChange={handleChange} required placeholder="49.99" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Rating</label>
                      <input name="rating" type="number" step="0.1" min="1" max="5" className="form-control" value={form.rating} onChange={handleChange} />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Thumbnail URL</label>
                      <input name="thumbnail" className="form-control" value={form.thumbnail} onChange={handleChange} placeholder="https://..." />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Description</label>
                      <textarea name="description" className="form-control" rows={3} value={form.description} onChange={handleChange} placeholder="Course description..."></textarea>
                    </div>

                    {/* Lessons Builder */}
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Lessons</label>
                      <div className="p-3 rounded-3" style={{ background: 'var(--surface)', border: '1.5px solid var(--border)' }}>
                        <div className="row g-2 mb-2">
                          <div className="col-md-5">
                            <input
                              className="form-control form-control-sm"
                              placeholder="Lesson title"
                              value={lessonInput.title}
                              onChange={e => setLessonInput(p => ({ ...p, title: e.target.value }))}
                            />
                          </div>
                          <div className="col-md-3">
                            <input
                              className="form-control form-control-sm"
                              placeholder="Duration"
                              value={lessonInput.duration}
                              onChange={e => setLessonInput(p => ({ ...p, duration: e.target.value }))}
                            />
                          </div>
                          <div className="col-md-2">
                            <select
                              className="form-select form-select-sm"
                              value={lessonInput.type}
                              onChange={e => setLessonInput(p => ({ ...p, type: e.target.value }))}
                            >
                              <option value="video">Video</option>
                              <option value="quiz">Quiz</option>
                            </select>
                          </div>
                          <div className="col-md-2">
                            <button type="button" className="btn btn-primary btn-sm w-100" onClick={addLesson}>
                              <i className="bi bi-plus-lg"></i>
                            </button>
                          </div>
                        </div>
                        {(form.lessons || []).length === 0 ? (
                          <p className="text-muted small mb-0 text-center py-2">No lessons added yet</p>
                        ) : (
                          <div className="d-flex flex-column gap-1">
                            {form.lessons.map((l, idx) => (
                              <div key={l.id} className="d-flex align-items-center gap-2 p-2 bg-white rounded-2 border">
                                <span className="badge bg-primary rounded-pill">{idx + 1}</span>
                                <span className="flex-grow-1 small fw-semibold">{l.title}</span>
                                <span className="badge bg-light text-muted">{l.type}</span>
                                <span className="text-muted small">{l.duration}</span>
                                <button type="button" className="btn btn-sm btn-outline-danger py-0 px-1" onClick={() => removeLesson(l.id)}>
                                  <i className="bi bi-x"></i>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="btn btn-primary">
                    <i className={`bi bi-${editId ? 'check-lg' : 'plus-lg'} me-2`}></i>
                    {editId ? 'Update Course' : 'Create Course'}
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
                <div style={{ fontSize: '2.5rem' }}>🗑️</div>
                <h5 className="mt-2 mb-1">Delete Course?</h5>
                <p className="text-muted small">This action cannot be undone.</p>
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
