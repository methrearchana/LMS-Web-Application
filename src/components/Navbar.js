import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <nav className="navbar navbar-expand-lg lms-navbar sticky-top">
      <div className="container">
        <Link className="navbar-brand" to="/">
          LMS <span> Portal</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMain"
          style={{ borderColor: "rgba(255,255,255,0.3)", color: "#fff" }}
        >
          <i
            className="bi bi-list"
            style={{ fontSize: "1.4rem", color: "#fff" }}
          ></i>
        </button>

        <div className="collapse navbar-collapse" id="navbarMain">
          <ul className="navbar-nav me-auto gap-1">
            <li className="nav-item">
              <NavLink className="nav-link" to="/" end>
                <i className="bi bi-grid me-1"></i> Courses
              </NavLink>
            </li>
            {isAuthenticated && user?.role !== "admin" && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/my-courses">
                  <i className="bi bi-bookmark me-1"></i> My Learning
                </NavLink>
              </li>
            )}
            {isAuthenticated && user?.role === "admin" && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin">
                  <i className="bi bi-shield-check me-1"></i> Admin
                </NavLink>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-2">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="btn btn-outline-light btn-sm rounded-pill px-3"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="btn btn-primary btn-sm rounded-pill px-3"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="dropdown">
                <div
                  className="navbar-avatar dropdown-toggle"
                  data-bs-toggle="dropdown"
                  style={{ cursor: "pointer" }}
                  title={user?.name}
                >
                  {initials}
                </div>
                <ul className="dropdown-menu dropdown-menu-end shadow">
                  <li>
                    <span className="dropdown-item-text small fw-bold text-muted">
                      {user?.name}
                      <span
                        className="badge bg-primary ms-2"
                        style={{ fontSize: "0.65rem" }}
                      >
                        {user?.role}
                      </span>
                    </span>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  {user?.role !== "admin" && (
                    <li>
                      <Link className="dropdown-item" to="/my-courses">
                        <i className="bi bi-bookmark me-2"></i> My Courses
                      </Link>
                    </li>
                  )}
                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={handleLogout}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i> Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
