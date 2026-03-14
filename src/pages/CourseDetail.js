import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getCourseById,
  getEnrollmentByUserAndCourse,
  createEnrollment,
  updateUser,
  getUserById,
} from '../services/api';
import useAuthStore from '../store/authStore';
import Toast from '../components/Toast';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser: updateStore } = useAuthStore();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    getCourseById(id)
      .then(res => { setCourse(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (isAuthenticated && user) {
      getEnrollmentByUserAndCourse(user.id, parseInt(id))
        .then(res => setIsEnrolled(res.data.length > 0));
    }
  }, [isAuthenticated, user, id]);

  const handleEnroll = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setEnrolling(true);
    try {
      await createEnrollment({
        userId: user.id,
        courseId: course.id,
        enrolledAt: new Date().toISOString().split('T')[0],
        progress: 0,
        completedLessons: [],
      });
      const updatedEnrolled = [...(user.enrolledCourses || []), course.id];
      await updateUser(user.id, { ...user, enrolledCourses: updatedEnrolled });
      const fresh = await getUserById(user.id);
      updateStore(fresh.data);
      setIsEnrolled(true);
      setToast({ message: 'Successfully enrolled!', type: 'success' });
    } catch (e) {
      setToast({ message: 'Enrollment failed', type: 'danger' });
    }
    setEnrolling(false);
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}></div>
    </div>
  );
  if (!course) return (
    <div className="container py-5 text-center">
      <i className="bi bi-exclamation-circle fs-1 text-muted"></i>
      <h4 className="mt-3">Course not found</h4>
      <button className="btn btn-primary mt-3" onClick={() => navigate('/')}>Back to Courses</button>
    </div>
  );

  const stars = Array.from({ length: 5 }, (_, i) => (
    <i key={i} className={`bi bi-star${i < Math.round(course.rating) ? '-fill' : ''} text-warning`}></i>
  ));

  return (
    <>
      <div className="course-detail-hero">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <nav className="mb-3">
                <button className="btn btn-sm btn-outline-light rounded-pill" onClick={() => navigate('/')}>
                  <i className="bi bi-arrow-left me-1"></i> Back
                </button>
              </nav>
              <span className="badge bg-primary me-2">{course.category}</span>
              <span className="badge bg-secondary">{course.level}</span>
              <h1 className="mt-2 mb-2">{course.title}</h1>
              <p style={{ color: 'rgba(255,255,255,0.7)' }}>{course.description}</p>

              <div className="d-flex align-items-center gap-3 flex-wrap mt-3">
                <div>{stars} <span className="ms-1" style={{ color: 'rgba(255,255,255,0.8)' }}>{course.rating} ({course.students?.toLocaleString()} students)</span></div>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>|</span>
                <span style={{ color: 'rgba(255,255,255,0.7)' }}><i className="bi bi-person me-1"></i>{course.instructor}</span>
                <span style={{ color: 'rgba(255,255,255,0.7)' }}><i className="bi bi-clock me-1"></i>{course.duration}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-4">
        <div className="row g-4">
          <div className="col-lg-8">
            {/* Lessons */}
            <div className="section-tag mb-2">Curriculum</div>
            <h4 className="mb-3" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
              {course.lessons?.length} Lessons
            </h4>
            <div className="accordion lesson-accordion" id="lessonsAccordion">
              {course.lessons?.map((lesson, i) => (
                <div className="accordion-item border-0 mb-2" key={lesson.id}
                  style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1.5px solid var(--border) !important' }}>
                  <h2 className="accordion-header">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target={`#lesson${i}`}
                    >
                      <span className="badge bg-primary bg-opacity-10 text-primary me-2 rounded-pill">{i + 1}</span>
                      {lesson.title}
                      <span className="ms-auto me-3 badge bg-light text-muted">
                        <i className={`bi bi-${lesson.type === 'quiz' ? 'question-circle' : 'play-circle'} me-1`}></i>
                        {lesson.type}
                      </span>
                    </button>
                  </h2>
                  <div id={`lesson${i}`} className="accordion-collapse collapse">
                    <div className="accordion-body py-2 px-3 text-muted small">
                      <i className="bi bi-clock me-1"></i> Duration: {lesson.duration}
                      {isEnrolled && (
                        <button
                          className="btn btn-sm btn-primary ms-3"
                          onClick={() => navigate(`/player/${course.id}?lesson=${lesson.id}`)}
                        >
                          <i className="bi bi-play-fill me-1"></i> Start Lesson
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow" style={{ borderRadius: 'var(--radius)', position: 'sticky', top: '80px' }}>
              <img
                src={course.thumbnail}
                alt={course.title}
                className="card-img-top"
                style={{ borderRadius: 'var(--radius) var(--radius) 0 0', height: 180, objectFit: 'cover' }}
              />
              <div className="card-body p-4">
                <div className="price-tag mb-3" style={{ fontSize: '1.8rem' }}>${course.price}</div>

                {isEnrolled ? (
                  <div className="text-center">
                    <div className="alert alert-success py-2 rounded-3">
                      <i className="bi bi-check-circle-fill me-2"></i>You are enrolled!
                    </div>
                    <button
                      className="btn btn-primary w-100"
                      onClick={() => navigate(`/player/${course.id}`)}
                    >
                      <i className="bi bi-play-fill me-2"></i> Continue Learning
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn btn-primary w-100 py-2"
                    onClick={handleEnroll}
                    disabled={enrolling}
                  >
                    {enrolling ? (
                      <><span className="spinner-border spinner-border-sm me-2"></span>Enrolling...</>
                    ) : (
                      <><i className="bi bi-lightning-fill me-2"></i>Enroll Now</>
                    )}
                  </button>
                )}

                <div className="mt-3 d-flex flex-column gap-2">
                  {[
                    { icon: 'play-circle', text: `${course.lessons?.length} lessons` },
                    { icon: 'clock', text: course.duration + ' total' },
                    { icon: 'phone', text: 'Access on all devices' },
                    { icon: 'award', text: 'Certificate of completion' },
                  ].map(item => (
                    <div key={item.icon} className="d-flex align-items-center gap-2 text-muted small">
                      <i className={`bi bi-${item.icon} text-primary`}></i> {item.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="toast-container">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}
    </>
  );
}
