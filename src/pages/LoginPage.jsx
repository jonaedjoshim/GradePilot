import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { signIn } from "../lib/auth-client";

const LOGIN_TOAST_ID = "gradepilot-login";

export default function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    if (!form.email.trim() || !form.password) {
      toast.error("Please complete all fields", {
        id: LOGIN_TOAST_ID,
      });
      return;
    }

    setLoading(true);
    toast.dismiss(LOGIN_TOAST_ID);

    try {
      const { error } = await signIn.email({
        email: form.email.trim(),
        password: form.password,
      });

      if (error) {
        toast.error(error.message || "Unable to sign in", {
          id: LOGIN_TOAST_ID,
        });
        return;
      }

      toast.success("Welcome back!", {
        id: LOGIN_TOAST_ID,
      });

      navigate("/", { replace: true });
    } catch {
      toast.error("Something went wrong. Please try again.", {
        id: LOGIN_TOAST_ID,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6"
      style={{ background: "var(--gp-bg)" }}
    >
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
            <GraduationCap size={25} />
          </span>

          <span
            className="text-xl font-bold tracking-tight"
            style={{ color: "var(--gp-text)" }}
          >
            GradePilot
          </span>
        </Link>

        <div className="gp-card p-6 sm:p-8">
          <div className="mb-7 text-center">
            <div
              className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl"
              style={{
                background: "var(--gp-primary-bg)",
                color: "var(--gp-primary)",
              }}
            >
              <LockKeyhole size={23} />
            </div>

            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: "var(--gp-text)" }}
            >
              Welcome back
            </h1>

            <p
              className="mt-2 text-sm"
              style={{ color: "var(--gp-text-muted)" }}
            >
              Sign in to continue your academic journey.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="gp-label">
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-3.5"
                  style={{ color: "var(--gp-text-muted)" }}
                />

                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={updateField}
                  required
                  className="gp-input !pl-11"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="gp-label">
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-3.5"
                  style={{ color: "var(--gp-text-muted)" }}
                />

                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={updateField}
                  required
                  className="gp-input !pl-11 !pr-11"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-3"
                  style={{ color: "var(--gp-text-muted)" }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="gp-btn gp-btn-primary w-full"
            >
              {loading ? "Signing in..." : "Sign In"}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>

          <div
            className="mt-6 border-t pt-6 text-center"
            style={{ borderColor: "var(--gp-border)" }}
          >
            <p className="text-sm" style={{ color: "var(--gp-text-muted)" }}>
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold"
                style={{ color: "var(--gp-primary)" }}
              >
                Create account
              </Link>
            </p>
          </div>
        </div>

        <div
          className="mt-6 flex items-center justify-center gap-2 text-xs"
          style={{ color: "var(--gp-text-muted)" }}
        >
          <ShieldCheck size={15} />
          Secure authentication powered by Better Auth
        </div>

        <Link
          to="/calculator"
          className="mt-5 block text-center text-xs font-semibold"
          style={{ color: "var(--gp-primary)" }}
        >
          Continue as guest
        </Link>
      </div>
    </div>
  );
}
