import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, NavLink, useLocation, useNavigate } from "react-router";
import {
  ChevronDown,
  ChevronRight,
  GraduationCap,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Sun,
  UserRound,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAcademic } from "../../hooks/useAcademic";
import { signOut, useSession } from "../../lib/auth-client";
import { getCurrentPage, NAV_ITEMS } from "./navigation";

function getInitials(name) {
  if (!name?.trim()) return "GP";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function Topbar() {
  const { state, dispatch } = useAcademic();
  const { data: session, isPending } = useSession();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const accountRef = useRef(null);
  const signingOutRef = useRef(false);

  const currentPage = getCurrentPage(pathname);
  const isDark = state.theme === "dark";
  const user = session?.user;

  useEffect(() => {
    setAccountOpen(false);
    setMobileOpen(false);
  }, [pathname]);

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

  useEffect(() => {
    if (!accountOpen) return;

    const handlePointerDown = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setAccountOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [accountOpen]);

  const handleSignOut = async () => {
    if (signingOutRef.current) return;

    signingOutRef.current = true;
    setSigningOut(true);
    setAccountOpen(false);

    try {
      const { error } = await signOut();

      if (error) {
        toast.error(error.message || "Unable to sign out", {
          id: "gradepilot-signout",
        });
        return;
      }

      toast.success("Signed out successfully", {
        id: "gradepilot-signout",
      });

      navigate("/", { replace: true });
    } catch {
      toast.error("Unable to sign out. Please try again.", {
        id: "gradepilot-signout",
      });
    } finally {
      signingOutRef.current = false;
      setSigningOut(false);
    }
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
        <div className="flex h-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
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

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <span
              className="hidden rounded-full border px-3 py-1 text-[11px] font-medium xl:inline-flex"
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
              onClick={() => dispatch({ type: "TOGGLE_THEME" })}
              aria-label={
                isDark ? "Switch to light mode" : "Switch to dark mode"
              }
              title={isDark ? "Light mode" : "Dark mode"}
              className="flex size-10 shrink-0 items-center justify-center rounded-xl border transition-colors hover:bg-(--gp-surface-2)"
              style={{
                borderColor: "var(--gp-border)",
                color: "var(--gp-text-secondary)",
              }}
            >
              {isDark ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            {isPending ? (
              <div
                className="h-10 w-24 animate-pulse rounded-xl"
                style={{ background: "var(--gp-surface-2)" }}
                aria-label="Loading account"
              />
            ) : user ? (
              <div ref={accountRef} className="relative">
                <button
                  type="button"
                  onClick={() => setAccountOpen((open) => !open)}
                  aria-label="Account menu"
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                  className="flex h-10 max-w-48 items-center gap-2 rounded-xl border px-1.5 pr-2.5 transition-colors hover:bg-(--gp-surface-2)"
                  style={{ borderColor: "var(--gp-border)" }}
                >
                  <span
                    className="flex size-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold"
                    style={{
                      background: "var(--gp-primary-bg)",
                      color: "var(--gp-primary)",
                    }}
                  >
                    {getInitials(user.name)}
                  </span>

                  <span
                    className="hidden max-w-24 truncate text-xs font-semibold sm:block"
                    style={{ color: "var(--gp-text)" }}
                  >
                    {user.name}
                  </span>

                  <ChevronDown
                    size={14}
                    className="hidden shrink-0 sm:block"
                    style={{ color: "var(--gp-text-muted)" }}
                  />
                </button>

                {accountOpen && (
                  <div
                    role="menu"
                    aria-label="Account options"
                    className="absolute right-0 top-full z-50 mt-2 w-64 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border p-2 shadow-xl"
                    style={{
                      background: "var(--gp-surface)",
                      borderColor: "var(--gp-border)",
                    }}
                  >
                    <div
                      className="border-b px-3 py-3"
                      style={{ borderColor: "var(--gp-border)" }}
                    >
                      <p
                        className="truncate text-sm font-semibold"
                        style={{ color: "var(--gp-text)" }}
                      >
                        {user.name}
                      </p>

                      <p
                        className="mt-1 truncate text-xs"
                        style={{ color: "var(--gp-text-muted)" }}
                      >
                        {user.email}
                      </p>

                      <span className="gp-badge gp-badge-success mt-3">
                        Signed in
                      </span>
                    </div>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleSignOut}
                      disabled={signingOut}
                      className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-(--gp-surface-2)"
                      style={{ color: "var(--gp-danger)" }}
                    >
                      <LogOut size={17} />
                      {signingOut ? "Signing out..." : "Sign Out"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="gp-btn gp-btn-primary whitespace-nowrap px-3 sm:px-4"
              >
                <LogIn size={17} />
                <span>Sign In</span>
              </Link>
            )}
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
              onClick={() => setMobileOpen(false)}
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
              transition={{
                type: "spring",
                damping: 30,
                stiffness: 300,
              }}
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
                  onClick={() => setMobileOpen(false)}
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
                  onClick={() => setMobileOpen(false)}
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
                      onClick={() => setMobileOpen(false)}
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
                className="shrink-0 border-t p-4"
                style={{ borderColor: "var(--gp-border)" }}
              >
                {!isPending && user ? (
                  <div className="space-y-3">
                    <div className="flex min-w-0 items-center gap-3 px-2">
                      <div
                        className="flex size-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold"
                        style={{
                          background: "var(--gp-primary-bg)",
                          color: "var(--gp-primary)",
                        }}
                      >
                        {getInitials(user.name)}
                      </div>

                      <div className="min-w-0">
                        <p
                          className="truncate text-sm font-semibold"
                          style={{ color: "var(--gp-text)" }}
                        >
                          {user.name}
                        </p>

                        <p
                          className="truncate text-xs"
                          style={{ color: "var(--gp-text-muted)" }}
                        >
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        handleSignOut();
                      }}
                      disabled={signingOut}
                      className="gp-btn gp-btn-secondary w-full"
                    >
                      <LogOut size={17} />
                      {signingOut ? "Signing out..." : "Sign Out"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="gp-btn gp-btn-primary w-full"
                    >
                      <LogIn size={17} />
                      Sign In
                    </Link>

                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="gp-btn gp-btn-secondary w-full"
                    >
                      <UserRound size={17} />
                      Create Account
                    </Link>
                  </div>
                )}
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
