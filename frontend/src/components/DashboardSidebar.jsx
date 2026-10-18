
import {
  Activity,
  ChartNoAxesCombined,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Command,
  FileSearch,
  Gauge,
  HelpCircle,
  LayoutDashboard,
  Settings2,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const mainItems = [
  { label: "Overview", icon: LayoutDashboard, to: "/dashboard" },
  { label: "New inspection", icon: Upload, to: "/dashboard/inspect" },
  { label: "Inspection history", icon: Clock3, to: "/dashboard/history" },
  { label: "Analytics", icon: ChartNoAxesCombined, to: "/dashboard/analytics" },
  { label: "Defect library", icon: FileSearch, to: "/dashboard/defects" },
];

export default function DashboardSidebar({ collapsed, onToggle }) {
  return (
    <aside
      className={`dashboard-sidebar ${collapsed ? "sidebar-collapsed" : ""}`}
    >
      <div className="sidebar-brand">
        <span className="brand-mark"><Command size={21} /></span>
        {!collapsed && (
          <span className="brand-name">
            DefectVision <span>AI</span>
            <small>INSPECTION STUDIO</small>
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={onToggle}
        className="sidebar-collapse"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
      </button>

      <div className="sidebar-workspace">
        <span className="workspace-dot" />
        {!collapsed && (
          <span>
            <strong>Local workspace</strong>
            <small>Steel quality lab</small>
          </span>
        )}
      </div>

      <p className="sidebar-section-label">
        {collapsed ? "•••" : "WORKSPACE"}
      </p>

      <nav className="sidebar-nav" aria-label="Dashboard navigation">
        {mainItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={label}
            to={to}
            end={to === "/dashboard"}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
            }
          >
            <Icon size={19} strokeWidth={1.8} />
            {!collapsed && <span>{label}</span>}
            {!collapsed && label === "New inspection" && (
              <span className="sidebar-plus">+</span>
            )}
          </NavLink>
        ))}
      </nav>

      <p className="sidebar-section-label">
        {collapsed ? "•••" : "SYSTEM"}
      </p>

      <nav className="sidebar-nav" aria-label="System navigation">
        <NavLink to="/dashboard/model" title={collapsed ? "Model status" : undefined} className={({ isActive }) => `sidebar-link ${isActive ? "sidebar-link-active" : ""}`}>
          <Gauge size={19} />
          {!collapsed && <span>Model status</span>}
          {!collapsed && <span className="model-status-dot" />}
        </NavLink>
        <NavLink to="/dashboard/settings" title={collapsed ? "Settings" : undefined} className={({ isActive }) => `sidebar-link ${isActive ? "sidebar-link-active" : ""}`}>
          <Settings2 size={19} />
          {!collapsed && <span>Settings</span>}
        </NavLink>
        <a href="mailto:support@example.com" title={collapsed ? "Help" : undefined} className="sidebar-link">
          <HelpCircle size={19} />
          {!collapsed && <span>Help & support</span>}
        </a>
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-plan-icon"><ShieldCheck size={19} /></div>
        {!collapsed && (
          <div className="sidebar-plan">
            <strong>Vision Engine</strong>
            <span><Activity size={12} /> Local inference</span>
          </div>
        )}
      </div>
    </aside>
  );
}
