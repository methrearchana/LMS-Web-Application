import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserEnrollments, getCourseById } from '../services/api';
import useAuthStore from '../store/authStore';

export default function MyCourses() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrolled = async () => {
      try {
        const enrollRes = await getUserEnrollments(user.id);
        const enrollments = enrollRes.data;
        const coursePromises = enrollments.map(e => getCourseById(e.courseId));
        const courseResults = await Promise.all(coursePromises);
        const merged = enrollments.map((e, i) => ({
          enrollment: e,
          course: courseResults[i].data,
        }));
        setEnrolledCourses(merged);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchEnrolled();
  }, [user.id]);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}></div>
    </div>
  );

  return (
    <div className="container page-wrapper">
      <div className="section-header">
        <div className="section-tag">Dashboard</div>
        <h2>My Learning</h2>
        <p>Continue where you left off</p>
      </div>

      {/* Stats Row */}
      <div className="row g-3 mb-4">
        <div className="col-sm-4">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(67,97,238,0.1)' }}>
              <i className="bi bi-collection" style={{ color: 'var(--primary)' }}></i>
            </div>
            <div className="stat-info">
              <div className="stat-value">{enrolledCourses.length}</div>
              <div className="stat-name">Enrolled Courses</div>
            </div>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(6,214,160,0.1)' }}>
              <i className="bi bi-check-circle" style={{ color: 'var(--secondary)' }}></i>
            </div>
            <div className="stat-info">
              <div className="stat-value">
                {enrolledCourses.filter(e => e.enrollment.progress === 100).length}
              </div>
              <div className="stat-name">Completed</div>
            </div>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(247,37,133,0.1)' }}>
              <i className="bi bi-graph-up" style={{ color: 'var(--accent)' }}></i>
            </div>
            <div className="stat-info">
              <div className="stat-value">
                {enrolledCourses.length > 0
                  ? Math.round(enrolledCourses.reduce((s, e) => s + e.enrollment.progress, 0) / enrolledCourses.length)
                  : 0}%
              </div>
              <div className="stat-name">Avg. Progress</div>
            </div>
          </div>
        </div>
      </div>

      {enrolledCourses.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-bookmark-x"></i>
          <h5>No enrolled courses yet</h5>
          <p>Browse our catalog and start learning today!</p>
          <button className="btn btn-primary rounded-pill mt-2" onClick={() => navigate('/')}>
            <i className="bi bi-compass me-2"></i> Explore Courses
          </button>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {enrolledCourses.map(({ enrollment, course }) => (
            <div key={enrollment.id} className="enrolled-card">
              <img
                className="enrolled-thumb d-none d-sm-block"
                src={course.thumbnail}
                alt={course.title}
                onError={e => { e.target.src = `https://placehold.co/180x120/4361ee/fff?text=Course`; }}
              />
              <div className="enrolled-body">
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                  <div>
                    <h6 className="enrolled-title mb-1">{course.title}</h6>
                    <small className="text-muted"><i className="bi bi-person me-1"></i>{course.instructor}</small>
                  </div>
                  <span className={`badge ${enrollment.progress === 100 ? 'bg-success' : 'bg-primary'} rounded-pill`}>
                    {enrollment.progress === 100 ? 'Completed' : 'In Progress'}
                  </span>
                </div>

                <div className="mt-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <div className="progress-label">Progress</div>
                    <small className="fw-bold" style={{ color: 'var(--primary)' }}>{enrollment.progress}%</small>
                  </div>
                  <div className="progress">
                    <div
                      className="progress-bar"
                      style={{ width: `${enrollment.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="d-flex gap-2 mt-3">
                  <button
                    className="btn btn-primary btn-sm rounded-pill"
                    onClick={() => navigate(`/player/${course.id}`)}
                  >
                    <i className="bi bi-play-fill me-1"></i>
                    {enrollment.progress > 0 ? 'Continue' : 'Start'}
                  </button>
                  <button
                    className="btn btn-outline-secondary btn-sm rounded-pill"
                    onClick={() => navigate(`/course/${course.id}`)}
                  >
                    <i className="bi bi-info-circle me-1"></i> Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
