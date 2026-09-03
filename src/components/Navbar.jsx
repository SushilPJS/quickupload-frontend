import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="navbar">
      <NavLink to="/dashboard" className="navbar-brand">
        <span className="navbar-logo">Q</span>
        QuickUpload
      </NavLink>
      <nav className="navbar-links">
        <NavLink to="/dashboard" end className={({ isActive }) => (isActive ? "active" : "")}>
          My Files
        </NavLink>
        {isAdmin && (
          <NavLink to="/admin" className={({ isActive }) => (isActive ? "active" : "")}>
            Admin
          </NavLink>
        )}
      </nav>
      <div className="navbar-user">
        <span className="navbar-username">
          {user.username}
          {isAdmin && <span className="badge">Admin</span>}
        </span>
        <button className="btn btn-secondary" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
