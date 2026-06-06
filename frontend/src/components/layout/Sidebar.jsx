import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  Database,
  BookOpen,
  FileText,
  Radio,
  Network,
  Settings,
  CheckCircle,
  Sparkles,
} from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/diagnose", icon: Search, label: "Diagnose" },
  { to: "/memory", icon: Database, label: "Memory" },
  { to: "/runbooks", icon: BookOpen, label: "Runbooks" },
  { to: "/logs", icon: FileText, label: "Logs" },
  { to: "/command-center", icon: Radio, label: "Command Center" },
  { to: "/architecture", icon: Network, label: "Architecture" },
];

export default function Sidebar() {
  return (
    <aside className="w-sidebar-width h-screen fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant flex flex-col z-50">
      <div className="px-gutter py-stack-large border-b border-outline-variant flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-background font-bold text-sm">
          A
        </div>
        <div>
          <h1 className="font-inter text-headline-lg font-bold text-primary tracking-tighter leading-none">
            AEGIS
          </h1>
          <p className="font-mono text-[10px] text-on-surface-variant leading-tight">
            Organizational Memory Platform
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-stack-large flex flex-col gap-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 text-body-base font-inter transition-colors ${
                isActive
                  ? "text-primary border-l-[3px] border-primary bg-surface-container-highest font-semibold"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface border-l-[3px] border-transparent"
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-outline-variant p-stack-large flex flex-col gap-1">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 text-body-base font-inter transition-colors ${
              isActive
                ? "text-primary border-l-[3px] border-primary bg-surface-container-highest font-semibold"
                : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface border-l-[3px] border-transparent"
            }`
          }
        >
          <Settings size={18} />
          Settings
        </NavLink>
        <div className="flex items-center gap-3 px-4 py-2 text-on-surface-variant text-body-sm font-inter">
          <CheckCircle size={16} className="text-green-500" />
          <span>
            Production Status:{" "}
            <span className="text-green-500">Healthy</span>
          </span>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 text-on-surface-variant text-body-sm font-inter">
          <Sparkles size={16} className="text-primary" />
          <span className="text-primary">Memory Connected</span>
        </div>
      </div>
    </aside>
  );
}
