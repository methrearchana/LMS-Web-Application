import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { getCourseById, getEnrollmentByUserAndCourse, updateEnrollment } from '../services/api';
import useAuthStore from '../store/authStore';
import Toast from '../components/Toast';

export default function CoursePlayer() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const init = async () => {
      const [courseRes, enrollRes] = await Promise.all([
        getCourseById(id),
        getEnrollmentByUserAndCourse(user.id, parseInt(id)),
      ]);
      const courseData = courseRes.data;
      setCourse(courseData);
      const enroll = enrollRes.data[0];
      if (enroll) {
        setEnrollment(enroll);
        setCompletedLessons(enroll.completedLessons || []);
      }
      const lessonParam = parseInt(searchParams.get('lesson'));
      const startLesson = lessonParam
        ? courseData.lessons.find(l => l.id === lessonParam)
        : courseData.lessons[0];
      setActiveLesson(startLesson);
      setLoading(false);
    };
    init().catch(() => setLoading(false));
  }, [id, user.id, searchParams]);

  const markComplete = async () => {
    if (!enrollment || !activeLesson) return;
    const newCompleted = completedLessons.includes(activeLesson.id)
      ? completedLessons
      : [...completedLessons, activeLesson.id];
    const progress = Math.round((newCompleted.length / course.lessons.length) * 100);

    try {
      await updateEnrollment(enrollment.id, { ...enrollment, completedLessons: newCompleted, progress });
      setCompletedLessons(newCompleted);
      setEnrollment(prev => ({ ...prev, progress }));
      setToast({ message: `Lesson marked as complete! Progress: ${progress}%`, type: 'success' });
      // Auto-advance
      const idx = course.lessons.findIndex(l => l.id === activeLesson.id);
      if (idx < course.lessons.length - 1) setActiveLesson(course.lessons[idx + 1]);
    } catch {
      setToast({ message: 'Could not update progress', type: 'danger' });
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}></div>
    </div>
  );

  if (!course) return <div className="container py-5 text-center"><h5>Course not found</h5></div>;

  const progress = enrollment?.progress || 0;

  return (
    <div className="container-fluid py-3 px-3 px-lg-4">
      {/* Top bar */}
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-sm btn-outline-secondary rounded-pill" onClick={() => navigate('/my-courses')}>
            <i className="bi bi-arrow-left me-1"></i> My Courses
          </button>
          <h6 className="mb-0 fw-bold" style={{ fontFamily: 'var(--font-display)' }}>{course.title}</h6>
        </div>
        <div className="d-flex align-items-center gap-3">
          <small className="text-muted">{progress}% complete</small>
          <div className="progress" style={{ width: 120, height: 6 }}>
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>

      <div className="player-layout">
        {/* Video Area */}
        <div>
          <div className="video-placeholder">
            <div className="play-btn" onClick={markComplete}>
              <i className="bi bi-play-fill"></i>
            </div>
            <h5 style={{ fontFamily: 'var(--font-display)' }}>{activeLesson?.title}</h5>
            <p className="mb-0" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
              <i className="bi bi-clock me-1"></i>{activeLesson?.duration}
              {activeLesson?.type === 'quiz' && <span className="badge bg-warning text-dark ms-2">Quiz</span>}
            </p>
          </div>

          {/* Lesson Info */}
          <div className="card border-0 mt-3" style={{ borderRadius: 'var(--radius)' }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                <div>
                  <h5 style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{activeLesson?.title}</h5>
                  <p className="text-muted mb-0 small">
                    Lesson {course.lessons.findIndex(l => l.id === activeLesson?.id) + 1} of {course.lessons.length}
                  </p>
                </div>
                {completedLessons.includes(activeLesson?.id) ? (
                  <span className="badge bg-success rounded-pill py-2 px-3">
                    <i className="bi bi-check-circle me-1"></i> Completed
                  </span>
                ) : (
                  <button className="btn btn-primary rounded-pill" onClick={markComplete}>
                    <i className="bi bi-check-circle me-2"></i>Mark Complete
                  </button>
                )}
              </div>

              {/* Prev/Next nav */}
              <div className="d-flex gap-2 mt-3">
                {course.lessons.findIndex(l => l.id === activeLesson?.id) > 0 && (
                  <button
                    className="btn btn-outline-secondary btn-sm rounded-pill"
                    onClick={() => {
                      const idx = course.lessons.findIndex(l => l.id === activeLesson?.id);
                      setActiveLesson(course.lessons[idx - 1]);
                    }}
                  >
                    <i className="bi bi-skip-backward me-1"></i> Previous
                  </button>
                )}
                {course.lessons.findIndex(l => l.id === activeLesson?.id) < course.lessons.length - 1 && (
                  <button
                    className="btn btn-primary btn-sm rounded-pill"
                    onClick={() => {
                      const idx = course.lessons.findIndex(l => l.id === activeLesson?.id);
                      setActiveLesson(course.lessons[idx + 1]);
                    }}
                  >
                    Next <i className="bi bi-skip-forward ms-1"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Lesson List Sidebar */}
        <div className="lesson-list-panel">
          <div className="panel-header">
            <i className="bi bi-list-ul me-2"></i>Course Content
            <span className="float-end text-muted small">{completedLessons.length}/{course.lessons.length}</span>
          </div>
          {course.lessons.map(lesson => (
            <div
              key={lesson.id}
              className={`lesson-item ${activeLesson?.id === lesson.id ? 'active' : ''} ${completedLessons.includes(lesson.id) ? 'completed' : ''}`}
              onClick={() => setActiveLesson(lesson)}
            >
              <span className="lesson-icon">
                {completedLessons.includes(lesson.id)
                  ? <i className="bi bi-check-circle-fill"></i>
                  : <i className={`bi bi-${lesson.type === 'quiz' ? 'question-circle' : 'play-circle'}`}></i>}
              </span>
              <span className="lesson-name">{lesson.title}</span>
              <span className="lesson-dur">{lesson.duration}</span>
            </div>
          ))}
        </div>
      </div>

      {toast && (
        <div className="toast-container">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  );
}
