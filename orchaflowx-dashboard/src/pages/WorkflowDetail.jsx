import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Play, RefreshCw } from "lucide-react";
import { getWorkflow, executeWorkflow } from "../api/client";
import { useToast } from "../hooks/useToast";

function StatusBadge({ status }) {
  const s = (status || "pending").toLowerCase();
  return <span className={`badge badge-${s}`}>{status}</span>;
}

export default function WorkflowDetail() {
  const { id } = useParams();
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const toast = useToast();

  const load = () => {
    setLoading(true);
    getWorkflow(id)
      .then((r) => setWorkflow(r.data))
      .catch(() => toast("Failed to load workflow", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleExecute = async () => {
    setExecuting(true);
    try {
      const res = await executeWorkflow(id);
      const ready = res.data?.ready_steps?.length ?? 0;
      toast(`Started — ${ready} step(s) dispatched to RabbitMQ`, "success");
      load();
    } catch {
      toast("Execution failed", "error");
    } finally {
      setExecuting(false);
    }
  };

  if (loading) return (
    <div style={{ padding: 32, color: "var(--text-muted)", fontFamily: "var(--mono)" }}>Loading…</div>
  );
  if (!workflow) return (
    <div style={{ padding: 32 }}>
      <p style={{ color: "var(--red)" }}>Workflow not found.</p>
      <Link to="/workflows" style={{ color: "var(--accent)" }}>← Back to workflows</Link>
    </div>
  );

  const steps = workflow.steps || [];

  return (
    <div style={{ padding: 32 }}>
      {/* Back */}
      <Link to="/workflows" style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        color: "var(--text-muted)", textDecoration: "none", fontSize: 13, marginBottom: 24,
      }}>
        <ArrowLeft size={14} /> Workflows
      </Link>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, fontFamily: "var(--mono)", marginBottom: 6 }}>
            {workflow.name}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <StatusBadge status={workflow.status} />
            <span className="mono" style={{ fontSize: 11, color: "var(--text-muted)" }}>{workflow.id}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost" onClick={load}><RefreshCw size={14} /></button>
          <button className="btn btn-success" onClick={handleExecute} disabled={executing}>
            <Play size={14} />
            {executing ? "Starting…" : "Execute Workflow"}
          </button>
        </div>
      </div>

      {/* Steps */}
      <div className="card">
        <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
          Steps ({steps.length})
        </h2>

        {steps.length === 0 ? (
          <div style={{ color: "var(--text-muted)", fontSize: 13, padding: "12px 0" }}>
            No steps added to this workflow yet. Use the{" "}
            <Link to="/steps" style={{ color: "var(--accent)" }}>Steps page</Link> to add them.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {steps.map((step, i) => (
              <div key={step.id} style={{
                display: "flex", alignItems: "center",
                padding: "12px 16px",
                background: "var(--surface2)",
                borderRadius: "var(--radius)",
                border: "1px solid var(--border)",
                gap: 12,
              }}>
                {/* Step index */}
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "var(--border2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontFamily: "var(--mono)", color: "var(--text-muted)",
                  flexShrink: 0,
                }}>
                  {i + 1}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{step.name}</div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                    {step.id}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {step.retry_count > 0 && (
                    <span style={{ fontSize: 11, color: "var(--yellow)", fontFamily: "var(--mono)" }}>
                      retry: {step.retry_count}
                    </span>
                  )}
                  <StatusBadge status={step.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}