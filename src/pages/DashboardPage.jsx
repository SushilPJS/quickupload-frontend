import { useCallback, useEffect, useState } from "react";
import apiClient from "../api/client.js";
import FileList from "../components/FileList.jsx";
import FileUpload from "../components/FileUpload.jsx";

const LIMIT = 10;

export default function DashboardPage() {
  const [files, setFiles] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (currentOffset) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await apiClient.get("/files", { params: { limit: LIMIT, offset: currentOffset } });
      setFiles(data.items);
      setTotal(data.total);
    } catch {
      setError("Could not load your files.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(offset);
  }, [load, offset]);

  return (
    <div className="page">
      <h1>My files</h1>
      <FileUpload onUploaded={() => load(offset)} />
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
        />
      )}
    </div>
  );
}
