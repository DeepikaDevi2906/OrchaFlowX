import { NavLink } from "react-router-dom";
import { Home, GitBranch, Layers, BarChart2, Plus } from "lucide-react";

const navItems = [
  { to: "/",          icon: Home,      label: "Overview"    },
  { to: "/workflows", icon: GitBranch, label: "Workflows"   },
  { to: "/steps",     icon: Layers,    label: "Steps"       },
  { to: "/metrics",   icon: BarChart2, label: "Metrics"     },
  { to: "/create",    icon: Plus,      label: "New Workflow" },
];

export default function Sidebar() {
  return (
    <aside style={{
      width: 220, minHeight: "100vh",
      background: "var(--surface)",
      borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      flexShrink: 0,
    }}>
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 30, height: 30,
            background: "var(--accent-dim)", borderRadius: 6,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <GitBranch size={16} color="var(--accent)" />
          </div>
          <div>
            <div style={{ fontFamily: "var(--mono)", fontWeight: 600, fontSize: 13 }}>OrchaFlowX</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>workflow engine</div>
          </div>
        </div>
      </div>

      <nav style={{ padding: "12px 10px", flex: 1 }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === "/"}
            style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 12px", borderRadius: 6, marginBottom: 2,
              textDecoration: "none", fontSize: 13, fontWeight: 500,
              color: isActive ? "var(--accent)" : "var(--text-muted)",
              background: isActive ? "var(--accent-dim)" : "transparent",
            })}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div style={{
        padding: "16px 20px", borderTop: "1px solid var(--border)",
        fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--mono)",
      }}>
        FastAPI · RabbitMQ · PostgreSQL
      </div>
    </aside>
  );
}