import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import useAuthStore from '../store/authStore';

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password) { setError('Please fill all fields'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      const user = await registerUser({ name: form.name, email: form.email, password: form.password });
      login(user);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo mb-1">Learn<span style={{ color: 'var(--text)' }}>Hub</span></div>
        <p className="text-center text-muted small mb-4">Join thousands of learners today</p>

        <h4 className="mb-4">Create Account</h4>

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 py-2 rounded-3">
            <i className="bi bi-exclamation-circle"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Full Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="John Doe"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div className="mb-4">
            <label className="form-label small fw-semibold">Confirm Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Repeat password"
              value={form.confirm}
              onChange={e => setForm({ ...form, confirm: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 py-2 rounded-3" disabled={loading}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Creating...</> : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-3 small text-muted">
          Already have an account? <Link to="/login" className="text-primary fw-semibold">Log In</Link>
        </p>
      </div>
    </div>
  );
}
