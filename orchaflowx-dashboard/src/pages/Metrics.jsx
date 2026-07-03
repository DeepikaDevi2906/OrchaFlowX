import { useEffect, useState } from "react";
import { RefreshCw, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { getRawMetrics, parseMetrics } from "../api/client";
import { useToast } from "../hooks/useToast";

const METRIC_LABELS = {
  workflow_started_total:      { label: "Workflows Started",    color: "var(--accent)" },
  workflow_completed_total:    { label: "Workflows Completed",  color: "var(--green)"  },
  workflow_failed_total:       { label: "Workflows Failed",     color: "var(--red)"    },
  step_completed_total:        { label: "Steps Completed",      color: "var(--green)"  },
  step_failed_total:           { label: "Steps Failed",         color: "var(--red)"    },
  workflow_retry_total:        { label: "Retries",              color: "var(--yellow)" },
  workflow_compensation_total: { label: "Compensations",        color: "var(--purple)" },
};

function MetricCard({ metricKey, value, color, label }) {
  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase",
        letterSpacing: "0.06em", fontFamily: "var(--mono)" }}>
        {label}
      </div>
      <div style={{ fontSize: 32, fontWeight: 600, fontFamily: "var(--mono)", color }}>
        {value ?? 0}
      </div>
      <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--mono)" }}>
        {metricKey}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--surface2)", border: "1px solid var(--border2)",
      borderRadius: 6, padding: "10px 14px", fontSize: 12,
    }}>
      <div style={{ color: "var(--text-muted)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "var(--mono)", fontWeight: 600 }}>{payload[0].value}</div>
    </div>
  );
};

export default function Metrics() {
  const [metrics, setMetrics] = useState({});
  const [raw, setRaw] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(false);
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await getRawMetrics();
      setRaw(res.data);
      setMetrics(parseMetrics(res.data));
      setLastUpdated(new Date());
    } catch {
      setError(true);
      toast("Could not reach /metrics — is the backend running?", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const chartData = Object.entries(METRIC_LABELS).map(([key, { label, color }]) => ({
    name: label.replace("Workflows ", "WF ").replace("Steps ", "Steps "),
    value: metrics[key] ?? 0,
    color,
  }));

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, fontFamily: "var(--mono)" }}>Metrics</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
            Live from <span className="mono">/metrics</span> (Prometheus format)
            {lastUpdated && (
              <span style={{ marginLeft: 12 }}>
                · updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <button className="btn btn-ghost" onClick={load} disabled={loading}>
          <RefreshCw size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
          Refresh
        </button>
      </div>

      {error ? (
        <div className="card" style={{ borderColor: "var(--red)", textAlign: "center", padding: 40 }}>
          <Activity size={32} color="var(--red)" style={{ marginBottom: 12 }} />
          <div style={{ color: "var(--red)", fontWeight: 500, marginBottom: 8 }}>
            Cannot reach metrics endpoint
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
            Make sure your FastAPI server is running and has a <span className="mono">/metrics</span> route.
          </div>
        </div>
      ) : (
        <>
          {/* Metric cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 14,
            marginBottom: 28,
          }}>
            {Object.entries(METRIC_LABELS).map(([key, { label, color }]) => (
              <MetricCard
                key={key}
                metricKey={key}
                label={label}
                value={metrics[key]}
                color={color}
              />
            ))}
          </div>

          {/* Bar chart */}
          <div className="card">
            <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 20 }}>Counters Overview</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barSize={32}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "var(--mono)" }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "var(--mono)" }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--border)" }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Raw metrics */}
          {raw && (
            <div className="card" style={{ marginTop: 20 }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Raw Prometheus Output</h2>
              <pre style={{
                fontFamily: "var(--mono)", fontSize: 11,
                color: "var(--text-muted)",
                background: "var(--surface2)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: 16,
                overflow: "auto",
                maxHeight: 300,
                lineHeight: 1.6,
              }}>
                {raw}
              </pre>
            </div>
          )}
        </>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}