import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { getSteps } from "../api/client";
import { useToast } from "../hooks/useToast";

function StatusBadge({ status }) {
  const s = (status || "pending").toLowerCase();
  return <span className={`badge badge-${s}`}>{status}</span>;
}

export default function Steps() {
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const toast = useToast();

  const load = () => {
    setLoading(true);
    getSteps()
      .then((r) => setSteps(r.data || []))
      .catch(() => toast("Failed to load steps", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const statuses = ["ALL", "PENDING", "COMPLETED", "FAILED", "RETRYING"];
  const filtered = filter === "ALL" ? steps : steps.filter((s) => s.status === filter);

  // Count by status
  const counts = statuses.slice(1).reduce((acc, s) => {
    acc[s] = steps.filter((st) => st.status === s).length;
    return acc;
  }, {});

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, fontFamily: "var(--mono)" }}>Steps</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
            {steps.length} total steps across all workflows
          </p>
        </div>
        <button className="btn btn-ghost" onClick={load}><RefreshCw size={14} /> Refresh</button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: "5px 14px",
              borderRadius: 999,
              border: "1px solid",
              fontSize: 12, fontFamily: "var(--mono)",
              cursor: "pointer",
              background: filter === s ? "var(--accent-dim)" : "transparent",
              borderColor: filter === s ? "var(--accent)" : "var(--border2)",
              color: filter === s ? "var(--accent)" : "var(--text-muted)",
              transition: "all 0.15s",
            }}
          >
            {s} {s !== "ALL" && counts[s] > 0 && `(${counts[s]})`}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontFamily: "var(--mono)" }}>
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
            No steps with status "{filter}".
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface2)" }}>
                {["Step Name", "Step ID", "Workflow ID", "Status", "Retries"].map((h) => (
                  <th key={h} style={{
                    padding: "12px 20px", textAlign: "left",
                    fontSize: 11, fontWeight: 500,
                    color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((step, i) => (
                <tr key={step.id} style={{
                  borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none",
                }}>
                  <td style={{ padding: "14px 20px", fontWeight: 500 }}>{step.name}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <span className="mono" style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {step.id?.slice(0, 8)}…
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <span className="mono" style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {step.workflow_id?.slice(0, 8)}…
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <StatusBadge status={step.status} />
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    {step.retry_count > 0 ? (
                      <span className="mono" style={{ color: "var(--yellow)", fontSize: 12 }}>
                        {step.retry_count}
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-muted)", fontSize: 12 }}>0</span>
                    )}
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