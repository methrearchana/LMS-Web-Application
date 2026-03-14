import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import useAuthStore from '../store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Please fill all fields'); return; }
    setLoading(true);
    try {
      const user = await loginUser(form.email, form.password);
      if (!user) { setError('Invalid email or password'); setLoading(false); return; }
      login(user);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch {
      setError('Login failed. Is the JSON server running?');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo mb-1">Learn<span style={{ color: 'var(--text)' }}>Hub</span></div>
        <p className="text-center text-muted small mb-4">Sign in to continue learning</p>

        <h4 className="mb-4">Welcome Back</h4>

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 py-2 rounded-3">
            <i className="bi bi-exclamation-circle"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Email address</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-envelope text-muted"></i>
              </span>
              <input
                type="email"
                className="form-control border-start-0"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                style={{ borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' }}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small fw-semibold">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-lock text-muted"></i>
              </span>
              <input
                type="password"
                className="form-control border-start-0"
                placeholder="Your password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                style={{ borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' }}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 py-2 rounded-3" disabled={loading}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Signing in...</> : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 p-3 rounded-3" style={{ background: 'var(--surface)' }}>
          <p className="small fw-bold text-muted mb-2">Demo Accounts:</p>
          <div className="small text-muted">
            <div><i className="bi bi-shield-check text-primary me-1"></i><strong>Admin:</strong> admin@lms.com / admin123</div>
            <div><i className="bi bi-person text-success me-1"></i><strong>Student:</strong> john@student.com / john123</div>
          </div>
        </div>

        <p className="text-center mt-3 small text-muted">
          Don't have an account? <Link to="/signup" className="text-primary fw-semibold">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
