import React from 'react';
import { useNavigate } from 'react-router-dom';

const levelColors = {
  Beginner: 'success',
  Intermediate: 'warning',
  Advanced: 'danger',
};

const categoryColors = {
  'Web Development': 'primary',
  'Backend': 'info',
  'Data Science': 'danger',
  'Design': 'secondary',
  'Cloud': 'warning',
};

export default function CourseCard({ course }) {
  const navigate = useNavigate();

  const stars = Array.from({ length: 5 }, (_, i) => (
    <i key={i} className={`bi bi-star${i < Math.round(course.rating) ? '-fill' : ''}`}></i>
  ));

  return (
    <div className="course-card" onClick={() => navigate(`/course/${course.id}`)}>
      <img
        src={course.thumbnail}
        alt={course.title}
        className="card-img-top"
        onError={(e) => {
          e.target.src = `https://placehold.co/400x220/4361ee/ffffff?text=${encodeURIComponent(course.title)}`;
        }}
      />
      <div className="card-body">
        <div className="d-flex gap-2 flex-wrap">
          <span className={`course-badge bg-${categoryColors[course.category] || 'primary'} bg-opacity-10 text-${categoryColors[course.category] || 'primary'}`}>
            {course.category}
          </span>
          <span className={`course-badge bg-${levelColors[course.level] || 'secondary'} bg-opacity-10 text-${levelColors[course.level] || 'secondary'}`}>
            {course.level}
          </span>
        </div>

        <h6 className="card-title">{course.title}</h6>
        <div className="instructor-name">
          <i className="bi bi-person me-1"></i>{course.instructor}
        </div>

        <div className="course-meta mt-2">
          <span><i className="bi bi-clock"></i> {course.duration}</span>
          <span><i className="bi bi-collection"></i> {course.lessons?.length || 0} lessons</span>
          <span><i className="bi bi-people"></i> {course.students?.toLocaleString()}</span>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-2">
          <div>
            <span className="rating-stars">{stars}</span>
            <small className="text-muted ms-1">{course.rating}</small>
          </div>
          <span className="price-tag">${course.price}</span>
        </div>
      </div>
    </div>
  );
}
