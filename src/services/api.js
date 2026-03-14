import axios from 'axios';

const API_BASE = 'http://localhost:3001';

const api = axios.create({ baseURL: API_BASE });

// ─── Courses ──────────────────────────────────────────────────
export const getCourses = () => api.get('/courses');
export const getCourseById = (id) => api.get(`/courses/${id}`);
export const createCourse = (data) => api.post('/courses', data);
export const updateCourse = (id, data) => api.put(`/courses/${id}`, data);
export const deleteCourse = (id) => api.delete(`/courses/${id}`);

// ─── Users ────────────────────────────────────────────────────
export const getUsers = () => api.get('/users');
export const getUserById = (id) => api.get(`/users/${id}`);
export const createUser = (data) => api.post('/users', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// ─── Auth (Simulated) ─────────────────────────────────────────
export const loginUser = async (email, password) => {
  const res = await api.get(`/users?email=${email}&password=${password}`);
  return res.data[0] || null;
};

export const registerUser = async (userData) => {
  // Check if email exists
  const check = await api.get(`/users?email=${userData.email}`);
  if (check.data.length > 0) throw new Error('Email already registered');
  const res = await api.post('/users', {
    ...userData,
    role: 'student',
    enrolledCourses: [],
    progress: {},
  });
  return res.data;
};

// ─── Enrollments ──────────────────────────────────────────────
export const getEnrollments = () => api.get('/enrollments');
export const getEnrollmentByUserAndCourse = (userId, courseId) =>
  api.get(`/enrollments?userId=${userId}&courseId=${courseId}`);
export const getUserEnrollments = (userId) => api.get(`/enrollments?userId=${userId}`);
export const createEnrollment = (data) => api.post('/enrollments', data);
export const updateEnrollment = (id, data) => api.put(`/enrollments/${id}`, data);
export const deleteEnrollment = (id) => api.delete(`/enrollments/${id}`);
