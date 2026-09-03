import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function AdminLoginPage() {
  const { login, logout, user, loading } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Skip while a submit is in flight: handleSubmit briefly sets `user` to a
    // just-logged-in non-admin account before it can log them back out again,
    // and this effect must not race that rejection with its own redirect.
    if (loading || submitting) return;
    if (user?.is_admin) {
      navigate("/admin", { replace: true });
    } else if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, submitting, navigate]);

  if (loading || (user && !submitting)) {
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const data = await login(username, password);
      if (!data.is_admin) {
        await logout();
        setError("This sign-in is for administrators only.");
        return;
      }
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page admin-auth-page">
      <form className="card auth-card admin-auth-card" onSubmit={handleSubmit}>
        <div className="brand-mark">
          <span className="navbar-logo admin-logo">Q</span>
          <h1>QuickUpload</h1>
        </div>
        <p className="admin-auth-tag">Administrator access</p>
        <p className="muted">Sign in with an administrator account to manage users and files.</p>

        {error && <p className="alert alert-error">{error}</p>}

        <label>
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        <button className="btn admin-btn" type="submit" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in as administrator"}
        </button>

        <p className="muted small auth-switch-link">
          Not an admin? <Link to="/login">Go to regular sign in</Link>
        </p>
      </form>
    </div>
  );
}
