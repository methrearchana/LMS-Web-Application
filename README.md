# 🎓 LearnHub — React LMS Portal

A full-featured Learning Management System (LMS) built with React, Bootstrap 5, Zustand, and JSON Server.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6 |
| Styling | Bootstrap 5.3, Bootstrap Icons |
| State (Auth) | Zustand (with persistence) |
| Mock Backend | JSON Server (REST API) |
| HTTP Client | Axios |

---

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── Navbar.js
│   ├── CourseCard.js
│   └── Toast.js
├── pages/            # Page components
│   ├── Home.js
│   ├── CourseDetail.js
│   ├── MyCourses.js
│   ├── CoursePlayer.js
│   ├── Login.js
│   ├── Signup.js
│   ├── AdminDashboard.js
│   ├── AdminCourses.js
│   ├── AdminUsers.js
│   └── AdminEnrollments.js
├── services/
│   └── api.js        # Axios API calls
├── store/
│   └── authStore.js  # Zustand auth store
├── routes/
│   └── ProtectedRoute.js
├── App.js
├── index.js
└── index.css
db.json               # JSON Server database
```

---

## ⚙️ Setup & Run

### Step 1 — Install dependencies

```bash
npm install
```

### Step 2 — Start JSON Server (in one terminal)

```bash
npm run server
```

This starts the mock REST API at: **http://localhost:3001**

### Step 3 — Start React App (in another terminal)

```bash
npm start
```

App runs at: **http://localhost:3000**

### OR — Run both together (requires concurrently)

```bash
npm run dev
```

---

## 🔐 Demo Accounts

| Role | Email | Password |
|------|-------|---------|
| Admin | admin@lms.com | admin123 |
| Student | john@student.com | john123 |

---

## 📄 API Endpoints (JSON Server)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /courses | Get all courses |
| GET | /courses/:id | Get single course |
| POST | /courses | Create course (admin) |
| PUT | /courses/:id | Update course (admin) |
| DELETE | /courses/:id | Delete course (admin) |
| GET | /users | Get all users |
| POST | /users | Register user |
| PUT | /users/:id | Update user |
| DELETE | /users/:id | Delete user |
| GET | /enrollments | Get all enrollments |
| POST | /enrollments | Enroll in course |
| PUT | /enrollments/:id | Update progress |
| DELETE | /enrollments/:id | Remove enrollment |

---

## ✨ Features

### Student
- Browse & search courses (filter by category/level)
- View course details and curriculum
- Enroll in courses
- Track learning progress with progress bars
- Course player with lesson navigation
- Mark lessons as complete (auto-advances)

### Admin
- Dashboard with platform analytics
- Full CRUD on Courses (with lesson builder)
- Full CRUD on Users
- Manage Enrollments (assign/update/remove)

### Authentication
- JWT-free, Zustand-persisted login state
- Protected routes (redirect to login)
- Admin-only routes
- Signup with validation

---

## 🎨 Design

- Dark navy navbar with gradient hero
- Card-based course listing with hover animations
- Clean admin sidebar layout
- Responsive (mobile-friendly)
- Toast notifications
- Loading spinners and empty states
