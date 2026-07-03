import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Play, Trash2, Plus, RefreshCw } from "lucide-react";
import { getWorkflows, deleteWorkflow, executeWorkflow } from "../api/client";
import { useToast } from "../hooks/useToast";

function StatusBadge({ status }) {
  const s = (status || "pending").toLowerCase();
  return <span className={`badge badge-${s}`}>{status}</span>;
}

export default function Workflows() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(null);
  const toast = useToast();

  const load = () => {
    setLoading(true);
    getWorkflows()
      .then((r) => setWorkflows(r.data || []))
      .catch(() => toast("Failed to load workflows", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete workflow "${name}"?`)) return;
    try {
      await deleteWorkflow(id);
      toast(`Deleted "${name}"`, "success");
      load();
    } catch {
      toast("Delete failed", "error");
    }
  };

  const handleExecute = async (id, name) => {
    setExecuting(id);
    try {
      const res = await executeWorkflow(id);
      const ready = res.data?.ready_steps?.length ?? 0;
      toast(`"${name}" started — ${ready} step(s) dispatched`, "success");
      load();
    } catch {
      toast("Execution failed", "error");
    } finally {
      setExecuting(null);
    }
  };

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, fontFamily: "var(--mono)" }}>Workflows</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
            {workflows.length} workflow{workflows.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost" onClick={load}>
            <RefreshCw size={14} /> Refresh
          </button>
          <Link to="/create">
            <button className="btn btn-primary"><Plus size={14} /> New Workflow</button>
          </Link>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontFamily: "var(--mono)" }}>
            Loading…
          </div>
        ) : workflows.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)", marginBottom: 16 }}>No workflows yet.</p>
            <Link to="/create">
              <button className="btn btn-primary"><Plus size={14} /> Create your first workflow</button>
            </Link>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface2)" }}>
                {["Name", "Workflow ID", "Status", "Actions"].map((h) => (
                  <th key={h} style={{
                    padding: "12px 20px", textAlign: "left",
                    fontSize: 11, fontWeight: 500,
                    color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {workflows.map((w, i) => (
                <tr key={w.id} style={{
                  borderBottom: i < workflows.length - 1 ? "1px solid var(--border)" : "none",
                  transition: "background 0.1s",
                }}>
                  <td style={{ padding: "16px 20px", fontWeight: 500 }}>
                    <Link to={`/workflows/${w.id}`} style={{ color: "var(--text)", textDecoration: "none" }}>
                      {w.name}
                    </Link>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <span className="mono" style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {w.id}
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <StatusBadge status={w.status} />
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="btn btn-success"
                        style={{ padding: "5px 12px", fontSize: 12 }}
                        onClick={() => handleExecute(w.id, w.name)}
                        disabled={executing === w.id}
                      >
                        <Play size={12} />
                        {executing === w.id ? "Starting…" : "Execute"}
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: "5px 12px", fontSize: 12 }}
                        onClick={() => handleDelete(w.id, w.name)}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}