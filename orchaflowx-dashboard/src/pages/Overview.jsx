import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GitBranch, Layers, CheckCircle2, XCircle, Clock, Play } from "lucide-react";
import { getWorkflows, getSteps } from "../api/client";

function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <div className="card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{
        width: 44, height: 44,
        background: accent + "22",
        borderRadius: 10,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon size={20} color={accent} />
      </div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 600, fontFamily: "var(--mono)", color: "var(--text)" }}>
          {value}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = (status || "pending").toLowerCase();
  return <span className={`badge badge-${s}`}>{status || "PENDING"}</span>;
}

export default function Overview() {
  const [workflows, setWorkflows] = useState([]);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getWorkflows(), getSteps()])
      .then(([w, s]) => {
        setWorkflows(w.data || []);
        setSteps(s.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const completed = steps.filter((s) => s.status === "COMPLETED").length;
  const failed    = steps.filter((s) => s.status === "FAILED").length;
  const pending   = steps.filter((s) => s.status === "PENDING").length;
  const recent    = [...workflows].slice(-6).reverse();

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, fontFamily: "var(--mono)" }}>
          Overview
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
          Live state of all workflows and steps
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: 16,
        marginBottom: 32,
      }}>
        <StatCard label="Total Workflows" value={loading ? "—" : workflows.length} icon={GitBranch} accent="var(--accent)" />
        <StatCard label="Total Steps"     value={loading ? "—" : steps.length}     icon={Layers}    accent="var(--purple)" />
        <StatCard label="Completed Steps" value={loading ? "—" : completed} icon={CheckCircle2} accent="var(--green)" />
        <StatCard label="Failed Steps"    value={loading ? "—" : failed}            icon={XCircle}   accent="var(--red)" />
        <StatCard label="Pending Steps"   value={loading ? "—" : pending}           icon={Clock}     accent="var(--yellow)" />
      </div>

      {/* Recent Workflows */}
      <div className="card">
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 16,
        }}>
          <h2 style={{ fontSize: 14, fontWeight: 600 }}>Recent Workflows</h2>
          <Link to="/workflows" style={{ color: "var(--accent)", fontSize: 12, textDecoration: "none" }}>
            View all →
          </Link>
        </div>

        {loading ? (
          <div style={{ color: "var(--text-muted)", fontFamily: "var(--mono)", fontSize: 13 }}>
            Loading...
          </div>
        ) : recent.length === 0 ? (
          <div style={{ color: "var(--text-muted)", fontSize: 13, padding: "24px 0", textAlign: "center" }}>
            No workflows yet.{" "}
            <Link to="/create" style={{ color: "var(--accent)" }}>Create one →</Link>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Name", "ID", "Status", "Action"].map((h) => (
                  <th key={h} style={{
                    padding: "8px 12px", textAlign: "left",
                    fontSize: 11, fontWeight: 500, color: "var(--text-muted)",
                    textTransform: "uppercase", letterSpacing: "0.06em",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((w) => (
                <tr key={w.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px 12px", fontWeight: 500 }}>{w.name}</td>
                  <td style={{ padding: "12px 12px" }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-muted)" }}>
                      {w.id?.slice(0, 8)}…
                    </span>
                  </td>
                  <td style={{ padding: "12px 12px" }}>
                    <StatusBadge status={w.status} />
                  </td>
                  <td style={{ padding: "12px 12px" }}>
                    <Link to={`/workflows/${w.id}`}>
                      <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }}>
                        <Play size={12} /> Execute
                      </button>
                    </Link>
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