import React, { useState, useEffect } from 'react';
import { getCourses } from '../services/api';
import CourseCard from '../components/CourseCard';

const CATEGORIES = ['All', 'Web Development', 'Backend', 'Data Science', 'Design', 'Cloud'];
const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCourses()
      .then(res => { setCourses(res.data); setLoading(false); })
      .catch(() => { setError('Could not load courses. Is JSON Server running on port 3001?'); setLoading(false); });
  }, []);

  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || c.category === category;
    const matchLevel = level === 'All' || c.level === level;
    return matchSearch && matchCat && matchLevel;
  });

  return (
    <>
      {/* Hero */}
      <section className="hero-section">
        <div className="container position-relative">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <div className="hero-badge">
                <i className="bi bi-lightning-charge-fill"></i> #1 Online Learning Platform
              </div>
              <h1>Learn Skills That<br /><span>Shape Your Future</span></h1>
              <p className="mb-3">Explore expert-led courses in web development, data science, design, and more. Learn at your own pace.</p>

              <div className="hero-search-bar">
                <i className="bi bi-search" style={{ color: 'rgba(255,255,255,0.5)' }}></i>
                <input
                  type="text"
                  placeholder="Search for courses..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <button className="btn btn-primary">Search</button>
              </div>

              <div className="hero-stats mt-4">
                <div className="hero-stat-item">
                  <div className="stat-num">{courses.length}+</div>
                  <div className="stat-label">Courses</div>
                </div>
                <div className="hero-stat-item">
                  <div className="stat-num">5K+</div>
                  <div className="stat-label">Students</div>
                </div>
                <div className="hero-stat-item">
                  <div className="stat-num">4.8★</div>
                  <div className="stat-label">Avg Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <div className="container page-wrapper">
        <div className="filter-bar">
          <i className="bi bi-funnel text-muted"></i>
          <select
            className="form-select form-select-sm"
            style={{ width: 'auto' }}
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select
            className="form-select form-select-sm"
            style={{ width: 'auto' }}
            value={level}
            onChange={e => setLevel(e.target.value)}
          >
            {LEVELS.map(l => <option key={l}>{l}</option>)}
          </select>
          <span className="ms-auto text-muted small">
            {filtered.length} course{filtered.length !== 1 ? 's' : ''} found
          </span>
        </div>

        <div className="section-header">
          <div className="section-tag">Explore</div>
          <h2>All Courses</h2>
          <p>Discover what you want to learn next</p>
        </div>

        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}></div>
            <p className="mt-3 text-muted">Loading courses...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 rounded-3">
            <i className="bi bi-exclamation-triangle-fill fs-5"></i>
            <div><strong>Server Error:</strong> {error}</div>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="empty-state">
            <i className="bi bi-search"></i>
            <h5>No courses found</h5>
            <p>Try adjusting your search or filters</p>
          </div>
        )}

        <div className="row g-4">
          {filtered.map(course => (
            <div key={course.id} className="col-12 col-sm-6 col-lg-4">
              <CourseCard course={course} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
