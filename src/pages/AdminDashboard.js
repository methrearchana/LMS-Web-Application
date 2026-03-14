import React, { useState, useEffect } from 'react';
import { getCourses, getUsers, getEnrollments } from '../services/api';
import AdminCourses from './AdminCourses';
import AdminUsers from './AdminUsers';
import AdminEnrollments from './AdminEnrollments';

const TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: 'speedometer2' },
  { key: 'courses', label: 'Courses', icon: 'collection' },
  { key: 'users', label: 'Users', icon: 'people' },
  { key: 'enrollments', label: 'Enrollments', icon: 'journal-check' },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ courses: 0, users: 0, enrollments: 0, revenue: 0 });
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      const [cRes, uRes, eRes] = await Promise.all([getCourses(), getUsers(), getEnrollments()]);
      const courses = cRes.data;
      const users = uRes.data;
      const enrollments = eRes.data;
      const revenue = enrollments.reduce((sum, e) => {
        const course = courses.find(c => c.id === e.courseId);
        return sum + (course?.price || 0);
      }, 0);
      setStats({
        courses: courses.length,
        users: users.filter(u => u.role !== 'admin').length,
        enrollments: enrollments.length,
        revenue: revenue.toFixed(2),
      });
      setAllCourses(courses);
      // Recent 5 enrollments with course info
      const recent = enrollments.slice(-5).reverse().map(e => ({
        ...e,
        course: courses.find(c => c.id === e.courseId),
        user: users.find(u => u.id === e.userId),
      }));
      setRecentEnrollments(recent);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { loadStats(); }, []);

  const STAT_CARDS = [
    { label: 'Total Courses', value: stats.courses, icon: 'collection', color: '#4361ee', bg: 'rgba(67,97,238,0.1)' },
    { label: 'Students', value: stats.users, icon: 'people', color: '#06d6a0', bg: 'rgba(6,214,160,0.1)' },
    { label: 'Enrollments', value: stats.enrollments, icon: 'journal-check', color: '#f72585', bg: 'rgba(247,37,133,0.1)' },
    { label: 'Revenue', value: `$${stats.revenue}`, icon: 'currency-dollar', color: '#fb8500', bg: 'rgba(251,133,0,0.1)' },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar d-none d-md-block">
        <div className="px-3 mb-3">
          <span style={{ color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>
            Admin Panel
          </span>
        </div>
        <div className="sidebar-title">Menu</div>
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`sidebar-link ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <i className={`bi bi-${tab.icon}`}></i>
            {tab.label}
          </button>
        ))}
      </aside>

      {/* Mobile Tab Bar */}
      <div className="d-md-none w-100" style={{ gridColumn: '1/-1' }}>
        <div className="d-flex border-bottom bg-white overflow-auto">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`btn btn-sm flex-fill py-2 rounded-0 ${activeTab === tab.key ? 'btn-primary' : 'btn-light'}`}
              style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}
              onClick={() => setActiveTab(tab.key)}
            >
              <i className={`bi bi-${tab.icon} me-1`}></i>{tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="admin-content">
        {activeTab === 'dashboard' && (
          <>
            <div className="section-header mb-4">
              <div className="section-tag">Overview</div>
              <h2>Dashboard</h2>
              <p>Platform analytics at a glance</p>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary"></div>
              </div>
            ) : (
              <>
                <div className="row g-3 mb-4">
                  {STAT_CARDS.map(card => (
                    <div key={card.label} className="col-6 col-lg-3">
                      <div className="stat-card">
                        <div className="stat-icon" style={{ background: card.bg }}>
                          <i className={`bi bi-${card.icon}`} style={{ color: card.color }}></i>
                        </div>
                        <div className="stat-info">
                          <div className="stat-value">{card.value}</div>
                          <div className="stat-name">{card.label}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent Enrollments */}
                <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 'var(--radius)' }}>
                  <div className="card-body p-0">
                    <div className="px-4 py-3 border-bottom d-flex justify-content-between align-items-center">
                      <h6 className="mb-0 fw-bold" style={{ fontFamily: 'var(--font-display)' }}>
                        <i className="bi bi-clock-history me-2 text-primary"></i>Recent Enrollments
                      </h6>
                      <button className="btn btn-sm btn-outline-primary rounded-pill" onClick={() => setActiveTab('enrollments')}>
                        View All
                      </button>
                    </div>
                    <div className="table-responsive">
                      <table className="table lms-table mb-0">
                        <thead>
                          <tr>
                            <th>Student</th>
                            <th>Course</th>
                            <th>Date</th>
                            <th>Progress</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentEnrollments.length === 0 ? (
                            <tr><td colSpan={4} className="text-center text-muted py-4">No enrollments yet</td></tr>
                          ) : (
                            recentEnrollments.map(e => (
                              <tr key={e.id}>
                                <td>
                                  <div className="d-flex align-items-center gap-2">
                                    <div className="navbar-avatar" style={{ width: 28, height: 28, fontSize: '0.7rem' }}>
                                      {e.user?.name?.[0] || '?'}
                                    </div>
                                    <span>{e.user?.name || 'Unknown'}</span>
                                  </div>
                                </td>
                                <td>
                                  <span className="fw-semibold">{e.course?.title || 'Unknown'}</span>
                                </td>
                                <td><small className="text-muted">{e.enrolledAt}</small></td>
                                <td>
                                  <div className="d-flex align-items-center gap-2">
                                    <div className="progress flex-grow-1" style={{ height: 6 }}>
                                      <div className="progress-bar" style={{ width: `${e.progress}%` }}></div>
                                    </div>
                                    <small className="fw-bold text-primary" style={{ width: 36 }}>{e.progress}%</small>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Course Summary */}
                <div className="card border-0 shadow-sm" style={{ borderRadius: 'var(--radius)' }}>
                  <div className="card-body p-0">
                    <div className="px-4 py-3 border-bottom">
                      <h6 className="mb-0 fw-bold" style={{ fontFamily: 'var(--font-display)' }}>
                        <i className="bi bi-bar-chart me-2 text-primary"></i>Course Performance
                      </h6>
                    </div>
                    <div className="table-responsive">
                      <table className="table lms-table mb-0">
                        <thead>
                          <tr>
                            <th>Course</th>
                            <th>Category</th>
                            <th>Level</th>
                            <th>Students</th>
                            <th>Rating</th>
                            <th>Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allCourses.map(c => (
                            <tr key={c.id}>
                              <td className="fw-semibold">{c.title}</td>
                              <td><span className="badge bg-primary bg-opacity-10 text-primary">{c.category}</span></td>
                              <td><span className="badge bg-secondary bg-opacity-10 text-secondary">{c.level}</span></td>
                              <td>{c.students?.toLocaleString()}</td>
                              <td>
                                <i className="bi bi-star-fill text-warning me-1" style={{ fontSize: '0.8rem' }}></i>
                                {c.rating}
                              </td>
                              <td className="fw-bold text-primary">${c.price}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {activeTab === 'courses' && <AdminCourses />}
        {activeTab === 'users' && <AdminUsers />}
        {activeTab === 'enrollments' && <AdminEnrollments />}
      </main>
    </div>
  );
}
