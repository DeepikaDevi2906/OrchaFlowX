import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Link as LinkIcon, ArrowRight } from "lucide-react";
import { createWorkflow, createStep, createDependency } from "../api/client";
import { useToast } from "../hooks/useToast";

/*
  3-step wizard:
  1. Name the workflow
  2. Add steps
  3. Add dependencies between steps, then submit
*/

export default function CreateWorkflow() {
  const navigate = useNavigate();
  const toast = useToast();

  const [phase, setPhase] = useState(1); // 1 | 2 | 3
  const [wfName, setWfName] = useState("");
  const [wfId, setWfId] = useState(null);   // set after phase 1 API call

  // Phase 2 state
  const [stepName, setStepName] = useState("");
  const [steps, setSteps] = useState([]);   // [{id, name}]
  const [addingStep, setAddingStep] = useState(false);

  // Phase 3 state
  const [parent, setParent] = useState("");
  const [child, setChild] = useState("");
  const [deps, setDeps] = useState([]);     // [{parent_step_id, child_step_id}]
  const [addingDep, setAddingDep] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  // ── Phase 1: create workflow ──────────────────────────────────────────────
  const handleCreateWorkflow = async () => {
    if (!wfName.trim()) return toast("Enter a workflow name", "error");
    setSubmitting(true);
    try {
      const res = await createWorkflow({ name: wfName.trim() });
      setWfId(res.data.id);
      toast(`Workflow "${wfName}" created`, "success");
      setPhase(2);
    } catch {
      toast("Failed to create workflow", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Phase 2: add steps ─────────────────────────────────────────────────────
  const handleAddStep = async () => {
    if (!stepName.trim()) return toast("Enter a step name", "error");
    setAddingStep(true);
    try {
      const res = await createStep({ name: stepName.trim(), workflow_id: wfId });
      setSteps((prev) => [...prev, { id: res.data.id, name: res.data.name }]);
      setStepName("");
      toast(`Step "${res.data.name}" added`, "success");
    } catch {
      toast("Failed to add step", "error");
    } finally {
      setAddingStep(false);
    }
  };

  // ── Phase 3: add dependencies ─────────────────────────────────────────────
  const handleAddDep = async () => {
    if (!parent || !child) return toast("Select both steps", "error");
    if (parent === child) return toast("A step cannot depend on itself", "error");
    const already = deps.find((d) => d.parent_step_id === parent && d.child_step_id === child);
    if (already) return toast("Dependency already added", "error");

    setAddingDep(true);
    try {
      await createDependency({ parent_step_id: parent, child_step_id: child });
      setDeps((prev) => [...prev, { parent_step_id: parent, child_step_id: child }]);
      const pName = steps.find((s) => s.id === parent)?.name;
      const cName = steps.find((s) => s.id === child)?.name;
      toast(`"${cName}" now depends on "${pName}"`, "success");
      setParent(""); setChild("");
    } catch {
      toast("Failed to add dependency", "error");
    } finally {
      setAddingDep(false);
    }
  };

  const finish = () => {
    navigate(`/workflows/${wfId}`);
  };

  const stepName_ = (id) => steps.find((s) => s.id === id)?.name ?? id.slice(0, 8);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: 32, maxWidth: 680, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, fontFamily: "var(--mono)", marginBottom: 8 }}>
        New Workflow
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 28 }}>
        Define your workflow in three steps.
      </p>

      {/* Progress */}
      <div style={{ display: "flex", gap: 0, marginBottom: 32 }}>
        {[["1", "Name"], ["2", "Steps"], ["3", "Dependencies"]].map(([n, label], i) => (
          <div key={n} style={{ display: "flex", alignItems: "center" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "6px 16px",
              borderRadius: 999,
              background: phase === i + 1 ? "var(--accent-dim)" : "transparent",
              border: `1px solid ${phase >= i + 1 ? "var(--accent)" : "var(--border2)"}`,
              color: phase >= i + 1 ? "var(--accent)" : "var(--text-muted)",
              fontSize: 12, fontFamily: "var(--mono)",
              transition: "all 0.2s",
            }}>
              <span style={{
                width: 20, height: 20, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: phase >= i + 1 ? "var(--accent)" : "var(--border2)",
                color: phase >= i + 1 ? "#fff" : "var(--text-muted)",
                fontSize: 11, fontWeight: 600,
              }}>{n}</span>
              {label}
            </div>
            {i < 2 && <div style={{ width: 20, height: 1, background: "var(--border2)", margin: "0 2px" }} />}
          </div>
        ))}
      </div>

      {/* ── Phase 1 ── */}
      {phase === 1 && (
        <div className="card">
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Name your workflow</h2>
          <label>Workflow Name</label>
          <input
            value={wfName}
            onChange={(e) => setWfName(e.target.value)}
            placeholder="e.g. order-fulfillment, daily-report"
            onKeyDown={(e) => e.key === "Enter" && handleCreateWorkflow()}
            style={{ marginBottom: 16 }}
          />
          <button
            className="btn btn-primary"
            onClick={handleCreateWorkflow}
            disabled={submitting || !wfName.trim()}
          >
            <ArrowRight size={14} />
            {submitting ? "Creating…" : "Create & Continue"}
          </button>
        </div>
      )}

      {/* ── Phase 2 ── */}
      {phase === 2 && (
        <div className="card">
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Add Steps</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 20 }}>
            Add each step of your workflow. Order doesn't matter here — you'll define dependencies next.
          </p>

          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            <input
              value={stepName}
              onChange={(e) => setStepName(e.target.value)}
              placeholder="Step name, e.g. validate-order"
              onKeyDown={(e) => e.key === "Enter" && handleAddStep()}
            />
            <button className="btn btn-primary" onClick={handleAddStep} disabled={addingStep || !stepName.trim()}>
              <Plus size={14} /> Add
            </button>
          </div>

          {steps.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
              {steps.map((s, i) => (
                <div key={s.id} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 14px",
                  background: "var(--surface2)",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--border)",
                }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: "var(--accent-dim)", color: "var(--accent)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontFamily: "var(--mono)", flexShrink: 0,
                  }}>{i + 1}</span>
                  <span style={{ fontWeight: 500, flex: 1 }}>{s.name}</span>
                  <span className="mono" style={{ fontSize: 10, color: "var(--text-muted)" }}>
                    {s.id.slice(0, 8)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="btn btn-primary"
              onClick={() => setPhase(3)}
              disabled={steps.length === 0}
            >
              <ArrowRight size={14} /> Continue to Dependencies
            </button>
            {steps.length > 0 && (
              <button className="btn btn-ghost" onClick={finish}>
                Skip & Finish
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Phase 3 ── */}
      {phase === 3 && (
        <div className="card">
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Add Dependencies</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 20 }}>
            Define which steps must complete before others can run. This builds your DAG.
          </p>

          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label>Parent (runs first)</label>
              <select value={parent} onChange={(e) => setParent(e.target.value)}>
                <option value="">Select step…</option>
                {steps.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div style={{ paddingTop: 20, color: "var(--text-muted)" }}>→</div>
            <div style={{ flex: 1 }}>
              <label>Child (runs after)</label>
              <select value={child} onChange={(e) => setChild(e.target.value)}>
                <option value="">Select step…</option>
                {steps.filter((s) => s.id !== parent).map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div style={{ paddingTop: 20 }}>
              <button
                className="btn btn-primary"
                onClick={handleAddDep}
                disabled={addingDep || !parent || !child}
              >
                <LinkIcon size={14} /> Link
              </button>
            </div>
          </div>

          {deps.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>
                {deps.length} dependenc{deps.length === 1 ? "y" : "ies"} defined
              </div>
              {deps.map((d, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 12px",
                  background: "var(--surface2)",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--border)",
                  marginBottom: 4,
                  fontSize: 13,
                }}>
                  <span style={{ color: "var(--accent)", fontWeight: 500 }}>{stepName_(d.parent_step_id)}</span>
                  <ArrowRight size={12} color="var(--text-muted)" />
                  <span style={{ fontWeight: 500 }}>{stepName_(d.child_step_id)}</span>
                </div>
              ))}
            </div>
          )}

          <button className="btn btn-success" onClick={finish}>
            Finish & View Workflow
          </button>
        </div>
      )}
    </div>
  );
}