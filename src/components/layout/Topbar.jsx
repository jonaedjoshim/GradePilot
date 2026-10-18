import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, NavLink, useLocation } from "react-router";
import { GraduationCap, Menu, Moon, Sun, X, ChevronRight } from "lucide-react";
import { useAcademic } from "../../hooks/useAcademic";
import { getCurrentPage, NAV_ITEMS } from "./navigation";

export default function Topbar() {
  const { state, dispatch } = useAcademic();
  const { pathname } = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);

  const currentPage = getCurrentPage(pathname);
  const isDark = state.theme === "dark";

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [mobileOpen]);

  const toggleTheme = () => {
    dispatch({ type: "TOGGLE_THEME" });
  };

  const closeMenu = () => {
    setMobileOpen(false);
  };

  return (
    <>
      <header
        className="sticky top-0 z-30 h-17 shrink-0 border-b"
        style={{
          background: "var(--gp-surface)",
          borderColor: "var(--gp-border)",
        }}
      >
        <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
              className="flex size-10 shrink-0 items-center justify-center rounded-xl border lg:hidden"
              style={{
                borderColor: "var(--gp-border)",
                color: "var(--gp-text)",
              }}
            >
              <Menu size={20} />
            </button>

            <div className="min-w-0">
              <div
                className="hidden items-center gap-2 text-xs sm:flex"
                style={{ color: "var(--gp-text-muted)" }}
              >
                <span>Workspace</span>
                <ChevronRight size={13} />
                <span className="truncate">{currentPage.label}</span>
              </div>

              <h1
                className="m-0 truncate text-base font-semibold tracking-tight sm:mt-0.5 sm:text-lg"
                style={{ color: "var(--gp-text)" }}
              >
                {currentPage.label}
              </h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <span
              className="hidden rounded-full border px-3 py-1 text-[11px] font-medium md:inline-flex"
              style={{
                borderColor: "var(--gp-border)",
                color: "var(--gp-text-muted)",
                background: "var(--gp-surface-2)",
              }}
            >
              Academic Workspace
            </span>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                isDark ? "Switch to light mode" : "Switch to dark mode"
              }
              title={isDark ? "Light mode" : "Dark mode"}
              className="flex size-10 items-center justify-center rounded-xl border transition-colors hover:bg-(--gp-surface-2)"
              style={{
                borderColor: "var(--gp-border)",
                color: "var(--gp-text-secondary)",
              }}
            >
              {isDark ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            <div
              className="flex size-9 items-center justify-center rounded-full border text-xs font-bold"
              style={{
                background: "var(--gp-primary-bg)",
                borderColor: "var(--gp-border)",
                color: "var(--gp-primary)",
              }}
              title="Guest workspace"
            >
              GP
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.button
              type="button"
              aria-label="Close navigation menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="absolute inset-0 h-full w-full bg-slate-950/50 backdrop-blur-[3px]"
            />

            <motion.aside
              id="mobile-navigation"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute inset-y-0 left-0 flex w-[min(320px,85vw)] flex-col border-r shadow-2xl"
              style={{
                background: "var(--gp-surface)",
                borderColor: "var(--gp-border)",
              }}
            >
              <div
                className="flex h-19 items-center justify-between border-b px-5"
                style={{ borderColor: "var(--gp-border)" }}
              >
                <Link
                  to="/"
                  onClick={closeMenu}
                  className="flex items-center gap-3"
                >
                  <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                    <GraduationCap size={22} />
                  </div>

                  <div>
                    <span
                      className="block text-base font-bold"
                      style={{ color: "var(--gp-text)" }}
                    >
                      GradePilot
                    </span>
                    <span
                      className="block text-[10px]"
                      style={{ color: "var(--gp-text-muted)" }}
                    >
                      Academic Workspace
                    </span>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={closeMenu}
                  aria-label="Close navigation"
                  className="flex size-9 items-center justify-center rounded-lg hover:bg-(--gp-surface-2)"
                  style={{ color: "var(--gp-text)" }}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <p
                  className="mb-3 px-3 text-[10px] font-bold tracking-[0.15em] uppercase"
                  style={{ color: "var(--gp-text-muted)" }}
                >
                  Navigation
                </p>

                <nav aria-label="Mobile main navigation" className="space-y-1">
                  {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      end={to === "/"}
                      onClick={closeMenu}
                      className="flex h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors"
                      style={({ isActive }) => ({
                        background: isActive
                          ? "var(--gp-primary-bg)"
                          : "transparent",
                        color: isActive
                          ? "var(--gp-primary)"
                          : "var(--gp-text-muted)",
                      })}
                    >
                      <Icon size={20} />
                      <span>{label}</span>
                    </NavLink>
                  ))}
                </nav>
              </div>

              <div
                className="border-t px-6 py-5"
                style={{ borderColor: "var(--gp-border)" }}
              >
                <p
                  className="text-xs font-medium"
                  style={{ color: "var(--gp-text-muted)" }}
                >
                  Plan better. Perform better.
                </p>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
