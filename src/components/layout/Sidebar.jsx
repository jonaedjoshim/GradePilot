import { motion } from "framer-motion";
import { NavLink } from "react-router";
import {
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  PanelLeftClose,
} from "lucide-react";
import { useAcademic } from "../../hooks/useAcademic";
import { NAV_ITEMS } from "./navigation";

export default function Sidebar() {
  const { state, dispatch } = useAcademic();
  const collapsed = state.sidebarCollapsed;

  const toggleSidebar = () => {
    dispatch({ type: "TOGGLE_SIDEBAR" });
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 76 : 256 }}
      transition={{ duration: 0.22, ease: "easeInOut" }}
      className="sticky top-0 hidden h-screen shrink-0 flex-col overflow-hidden border-r lg:flex"
      style={{
        background: "var(--gp-surface)",
        borderColor: "var(--gp-border)",
      }}
    >
      <div className="flex h-19 shrink-0 items-center gap-3 px-4.5">
        <NavLink
          to="/"
          title={collapsed ? "GradePilot Dashboard" : undefined}
          className="flex min-w-0 items-center gap-3"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <GraduationCap size={23} strokeWidth={2} />
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <span
                className="block text-[17px] font-bold tracking-tight"
                style={{ color: "var(--gp-text)" }}
              >
                GradePilot
              </span>
              <span
                className="block text-[10px] font-medium tracking-[0.13em] uppercase"
                style={{ color: "var(--gp-text-muted)" }}
              >
                Academic Workspace
              </span>
            </div>
          )}
        </NavLink>
      </div>

      <div
        className="mx-4 border-t"
        style={{ borderColor: "var(--gp-border)" }}
      />

      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-6">
        {!collapsed && (
          <p
            className="mb-3 px-3 text-[10px] font-bold tracking-[0.15em] uppercase"
            style={{ color: "var(--gp-text-muted)" }}
          >
            Workspace
          </p>
        )}

        <nav aria-label="Main navigation" className="space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `group relative flex h-11 items-center gap-3 rounded-xl text-[13px] font-medium transition-colors ${
                  collapsed ? "justify-center px-2" : "px-3"
                } ${isActive ? "font-semibold" : ""}`
              }
              style={({ isActive }) => ({
                background: isActive ? "var(--gp-primary-bg)" : "transparent",
                color: isActive ? "var(--gp-primary)" : "var(--gp-text-muted)",
              })}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span
                      className="absolute top-2 bottom-2 left-0 w-0.75 rounded-r-full"
                      style={{ background: "var(--gp-primary)" }}
                    />
                  )}

                  <Icon
                    size={19}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    className="shrink-0"
                  />

                  {!collapsed && (
                    <span className="min-w-0 truncate">{label}</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div
        className="shrink-0 border-t p-3"
        style={{ borderColor: "var(--gp-border)" }}
      >
        {!collapsed && (
          <div
            className="mb-3 rounded-xl border p-3"
            style={{
              background: "var(--gp-surface-2)",
              borderColor: "var(--gp-border)",
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="flex size-8 items-center justify-center rounded-lg"
                style={{
                  background: "var(--gp-primary-bg)",
                  color: "var(--gp-primary)",
                }}
              >
                <GraduationCap size={17} />
              </div>

              <div className="min-w-0">
                <p
                  className="text-xs font-semibold"
                  style={{ color: "var(--gp-text)" }}
                >
                  Your academic journey
                </p>
                <p
                  className="mt-0.5 text-[11px]"
                  style={{ color: "var(--gp-text-muted)" }}
                >
                  Plan. Track. Improve.
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`flex h-10 w-full items-center rounded-xl text-xs font-medium transition-colors hover:bg-(--gp-surface-2) ${
            collapsed ? "justify-center" : "justify-between px-3"
          }`}
          style={{ color: "var(--gp-text-muted)" }}
        >
          {!collapsed && (
            <span className="flex items-center gap-2">
              <PanelLeftClose size={17} />
              Collapse sidebar
            </span>
          )}

          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={17} />}
        </button>
      </div>
    </motion.aside>
  );
}
