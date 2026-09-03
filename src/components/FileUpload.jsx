import { useRef, useState } from "react";
import apiClient from "../api/client.js";

const MAX_SIZE_MB = 500;

export default function FileUpload({ onUploaded }) {
  const inputRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function validateClientSide(file) {
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File is too large. Maximum size is ${MAX_SIZE_MB} MB.`;
    }
    if (file.size === 0) {
      return "File is empty.";
    }
    return null;
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setSuccess("");

    const clientError = validateClientSide(file);
    if (clientError) {
      setError(clientError);
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setProgress(0);
    try {
      await apiClient.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          if (evt.total) setProgress(Math.round((evt.loaded / evt.total) * 100));
        },
      });
      setSuccess(`"${file.name}" uploaded successfully.`);
      onUploaded?.();
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setProgress(0);
      e.target.value = "";
    }
  }

  return (
    <div className="card upload-card">
      <h2>Upload a file</h2>
      <p className="muted">Any file type accepted — up to {MAX_SIZE_MB} MB.</p>

      <label className="file-input-label">
        <input ref={inputRef} type="file" onChange={handleFileChange} disabled={uploading} />
        {uploading ? `Uploading… ${progress}%` : "Choose a file to upload"}
      </label>

      {uploading && (
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      )}

      {error && <p className="alert alert-error">{error}</p>}
      {success && <p className="alert alert-success">{success}</p>}
    </div>
  );
}
