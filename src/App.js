import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import { ProtectedRoute, AdminRoute } from './routes/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CourseDetail from './pages/CourseDetail';
import MyCourses from './pages/MyCourses';
import CoursePlayer from './pages/CoursePlayer';
import AdminDashboard from './pages/AdminDashboard';

function NotFound() {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '70vh' }}>
      <div style={{ fontSize: '5rem', lineHeight: 1 }}>🎓</div>
      <h2 className="mt-3" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Page Not Found</h2>
      <p className="text-muted">The page you're looking for doesn't exist.</p>
      <a href="/" className="btn btn-primary rounded-pill mt-2">Go Home</a>
    </div>
  );
}

// Layout wrapper (includes navbar)
function Layout({ children }) {
  return (
    <>
      <Navbar />
      <div>{children}</div>
    </>
  );
}

// Full-screen layout (no navbar for auth pages)
function AuthLayout({ children }) {
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth pages – no navbar */}
        <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
        <Route path="/signup" element={<AuthLayout><Signup /></AuthLayout>} />

        {/* Main pages */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/course/:id" element={<Layout><CourseDetail /></Layout>} />

        {/* Protected student routes */}
        <Route
          path="/my-courses"
          element={
            <ProtectedRoute>
              <Layout><MyCourses /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/player/:id"
          element={
            <ProtectedRoute>
              <CoursePlayer />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Layout><AdminDashboard /></Layout>
            </AdminRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<Layout><NotFound /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}
