import { useCallback, useEffect, useState } from "react";
import apiClient from "../api/client.js";
import FileList from "../components/FileList.jsx";

const LIMIT = 10;

function AllFilesTab() {
  const [files, setFiles] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (currentOffset) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await apiClient.get("/admin/files", { params: { limit: LIMIT, offset: currentOffset } });
      setFiles(data.items);
      setTotal(data.total);
    } catch {
      setError("Could not load files.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(offset);
  }, [load, offset]);

  return (
    <>
      {error && <p className="alert alert-error">{error}</p>}
      {loading ? (
        <p className="muted">Loading files…</p>
      ) : (
        <FileList
          files={files}
          total={total}
          limit={LIMIT}
          offset={offset}
          onPageChange={setOffset}
          onChanged={() => load(offset)}
          showUploader
        />
      )}
    </>
  );
}

function ResetPasswordRow({ user, onDone, onCancel }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post(`/admin/users/${user.id}/reset-password`, { new_password: newPassword });
      onDone(`Password for "${user.username}" was reset.`);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(Array.isArray(detail) ? detail.map((d) => d.message).join(" ") : detail || "Could not reset password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <tr>
      <td colSpan={5}>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            minLength={10}
            required
            style={{ width: 200 }}
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            minLength={10}
            required
            style={{ width: 200 }}
          />
          <button className="btn btn-small" type="submit" disabled={submitting}>
            {submitting ? "Resetting…" : "Confirm reset"}
          </button>
          <button className="btn btn-secondary btn-small" type="button" onClick={onCancel}>
            Cancel
          </button>
          {error && <p className="alert alert-error" style={{ width: "100%", margin: 0 }}>{error}</p>}
        </form>
      </td>
    </tr>
  );
}

function ManageUsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "", is_admin: false });
  const [resettingUserId, setResettingUserId] = useState(null);
  const [resetSuccess, setResetSuccess] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await apiClient.get("/admin/users");
      setUsers(data);
    } catch {
      setError("Could not load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function handleCreate(e) {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setSubmitting(true);
    try {
      await apiClient.post("/admin/users", form);
      setFormSuccess(`User "${form.username}" created.`);
      setForm({ username: "", email: "", password: "", is_admin: false });
      loadUsers();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setFormError(Array.isArray(detail) ? detail.map((d) => d.message).join(" ") : detail || "Could not create user.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(user) {
    try {
      await apiClient.patch(`/admin/users/${user.id}/active`, { is_active: !user.is_active });
      loadUsers();
    } catch {
      setError("Could not update user status.");
    }
  }

  return (
    <div className="admin-users-grid">
      <form className="card" onSubmit={handleCreate}>
        <h2>Create a new user</h2>
        {formError && <p className="alert alert-error">{formError}</p>}
        {formSuccess && <p className="alert alert-success">{formSuccess}</p>}

        <label>
          Username
          <input
            type="text"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </label>
        <label>
          Temporary password
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            minLength={10}
            required
          />
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={form.is_admin}
            onChange={(e) => setForm({ ...form, is_admin: e.target.checked })}
          />
          Grant administrator access
        </label>
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Creating…" : "Create user"}
        </button>
      </form>

      <div className="card">
        <h2>Existing users</h2>
        {error && <p className="alert alert-error">{error}</p>}
        {resetSuccess && <p className="alert alert-success">{resetSuccess}</p>}
        {loading ? (
          <p className="muted">Loading users…</p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) =>
                  resettingUserId === u.id ? (
                    <ResetPasswordRow
                      key={u.id}
                      user={u}
                      onCancel={() => setResettingUserId(null)}
                      onDone={(message) => {
                        setResettingUserId(null);
                        setResetSuccess(message);
                      }}
                    />
                  ) : (
                    <tr key={u.id}>
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td>{u.is_admin ? "Admin" : "User"}</td>
                      <td>{u.is_active ? "Active" : "Disabled"}</td>
                      <td className="actions">
                        <button className="btn btn-small" onClick={() => toggleActive(u)}>
                          {u.is_active ? "Disable" : "Enable"}
                        </button>
                        <button className="btn btn-secondary btn-small" onClick={() => setResettingUserId(u.id)}>
                          Reset password
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPanelPage() {
  const [tab, setTab] = useState("files");

  return (
    <div className="page">
      <h1>Admin Panel</h1>
      <div className="tabs">
        <button className={tab === "files" ? "tab active" : "tab"} onClick={() => setTab("files")}>
          All uploaded files
        </button>
        <button className={tab === "users" ? "tab active" : "tab"} onClick={() => setTab("users")}>
          Manage users
        </button>
      </div>
      {tab === "files" ? <AllFilesTab /> : <ManageUsersTab />}
    </div>
  );
}
