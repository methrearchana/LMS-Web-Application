import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export function AdminRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}
