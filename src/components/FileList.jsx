import { useState } from "react";
import apiClient from "../api/client.js";

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleString();
}

export default function FileList({ files, total, limit, offset, onPageChange, onChanged, showUploader = false, canDelete }) {
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  async function handleDelete(file) {
    if (!window.confirm(`Delete "${file.original_filename}"? This cannot be undone.`)) return;
    setError("");
    setBusyId(file.id);
    try {
      await apiClient.delete(`/files/${file.id}`);
      onChanged?.();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not delete the file.");
    } finally {
      setBusyId(null);
    }
  }

  const page = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="card">
      <h2>Uploaded files</h2>
      {error && <p className="alert alert-error">{error}</p>}

      {files.length === 0 ? (
        <p className="muted">No files yet.</p>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Size</th>
                {showUploader && <th>Uploaded by</th>}
                <th>Uploaded on</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id}>
                  <td className="truncate" title={file.original_filename}>
                    {file.original_filename}
                  </td>
                  <td>{(file.extension || "—").replace(".", "").toUpperCase() || "—"}</td>
                  <td>{formatBytes(file.size_bytes)}</td>
                  {showUploader && <td>{file.uploaded_by_username}</td>}
                  <td>{formatDate(file.created_at)}</td>
                  <td className="actions">
                    <a className="btn btn-small" href={`/api/files/${file.id}/download`}>
                      Download
                    </a>
                    {(canDelete ?? true) && (
                      <button
                        className="btn btn-small btn-danger"
                        disabled={busyId === file.id}
                        onClick={() => handleDelete(file)}
                      >
                        {busyId === file.id ? "Deleting…" : "Delete"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > limit && (
        <div className="pagination">
          <button className="btn btn-small" disabled={page <= 1} onClick={() => onPageChange(offset - limit)}>
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button className="btn btn-small" disabled={page >= totalPages} onClick={() => onPageChange(offset + limit)}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
